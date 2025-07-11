const { onCall } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onUserCreated } = require("firebase-functions/v2/identity");
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// Helper: Check role from custom claims
async function getUserRole(uid) {
    const user = await auth.getUser(uid);
    return user.customClaims?.role || null;
}

// Helper: Assert owner
async function assertOwner(context) {
    if (!context.auth) {
        throw new Error('Authentication required');
    }
    const role = await getUserRole(context.auth.uid);
    if (role !== 'owner') {
        throw new Error('Owner role required');
    }
}

// Helper: Assert authenticated
function assertAuthenticated(context) {
    if (!context.auth) {
        throw new Error('Authentication required');
    }
}

// 1. Auto-assign worker role on user creation
exports.onNewUser = onUserCreated(async (event) => {
    try {
        const user = event.data; // This is the UserRecord
        if (!user) throw new Error('No user data available');

        // Set default role as worker
        await auth.setCustomUserClaims(user.uid, { role: 'worker' });

        // Create user document
        await db.collection('users').doc(user.uid).set({
            email: user.email,
            role: 'worker',
            displayName: user.displayName || user.email?.split('@')[0] || 'New Worker',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error in onUserCreated:', error);
        throw new Error('Failed to setup new user');
    }
});

// 2. Set User Role (owner only)
exports.setUserRole = onCall(async (data, context) => {
    try {
        await assertOwner(context);
        
        const { userId, role } = data;
        if (!userId || !['worker', 'owner'].includes(role)) {
            throw new Error('Invalid userId or role');
        }

        await auth.setCustomUserClaims(userId, { role });
        await db.collection('users').doc(userId).update({ role });

        return { success: true };
    } catch (error) {
        console.error('Error in setUserRole:', error);
        throw new Error(error.message);
    }
});

// 3. Record Sale (worker/owner)
exports.recordSale = onCall(async (data, context) => {
    try {
        assertAuthenticated(context);
        const { items, payment } = data;

        if (!items?.length || typeof payment !== 'number') {
            throw new Error('Invalid sale data');
        }

        return await db.runTransaction(async (transaction) => {
            // 1. Validate stock for all items
            const productRefs = items.map(item => db.collection('products').doc(item.productId));
            const productDocs = await Promise.all(
                productRefs.map(ref => transaction.get(ref))
            );

            // Check stock availability
            productDocs.forEach((doc, index) => {
                if (!doc.exists) {
                    throw new Error(`Product ${items[index].productId} not found`);
                }
                const product = doc.data();
                if (product.stock < items[index].quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}`);
                }
            });

            // 2. Calculate total and update stock
            let total = 0;
            productDocs.forEach((doc, index) => {
                const product = doc.data();
                total += product.price * items[index].quantity;
                transaction.update(doc.ref, {
                    stock: product.stock - items[index].quantity
                });
            });

            // 3. Create sale record
            const saleRef = db.collection('sales').doc();
            transaction.set(saleRef, {
                items: items.map((item, index) => ({
                    ...item,
                    price: productDocs[index].data().price,
                })),
                total,
                payment,
                change: payment - total,
                date: admin.firestore.FieldValue.serverTimestamp(),
                workerId: context.auth.uid
            });

            return {
                success: true,
                saleId: saleRef.id,
                total,
                change: payment - total
            };
        });
    } catch (error) {
        console.error('Error in recordSale:', error);
        throw new Error(error.message);
    }
});

// 4. Parse sale from voice input
exports.parseSaleFromVoice = onCall(async (data, context) => {
    try {
        assertAuthenticated(context);
        const { transcript } = data;

        // Use Gemini to parse the voice transcript
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Parse this voice command for a sale: "${transcript}"
        Expected format is quantities and product names.
        Return a JSON array of objects with productId and quantity.
        Example: [{"productId": "123", "quantity": 2}, {"productId": "456", "quantity": 1}]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const parsed = JSON.parse(response.text());

        return {
            success: true,
            items: parsed
        };
    } catch (error) {
        console.error('Error in parseSaleFromVoice:', error);
        throw new Error(error.message);
    }
});

// 5. AI Assistant (owner only)
exports.getAIAssistantResponse = onCall(async (data, context) => {
    try {
        await assertOwner(context);
        const { query, history } = data;

        // Fetch business data for context
        const [sales, expenses, products] = await Promise.all([
            db.collection('sales').orderBy('date', 'desc').limit(50).get(),
            db.collection('expenses').orderBy('date', 'desc').limit(20).get(),
            db.collection('products').get()
        ]);

        // Convert to plain objects and handle Timestamps
        const businessData = {
            sales: sales.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate().toISOString()
            })),
            expenses: expenses.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate().toISOString()
            })),
            products: products.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        };

        // Create system prompt with business context
        const systemPrompt = `You are an AI assistant for a small retail store. 
        You have access to the following business data:
        - Last 50 sales records
        - Last 20 expenses
        - Current product inventory
        
        Based on this data, provide relevant business insights and answer questions.
        Current business data: ${JSON.stringify(businessData)}
        
        Previous conversation:
        ${history.map(h => `${h.sender}: ${h.text}`).join('\n')}
        `;

        // Get response from Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent([systemPrompt, query]);
        const response = await result.response;
        
        return {
            response: response.text(),
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
    } catch (error) {
        console.error('Error in getAIAssistantResponse:', error);
        throw new Error(error.message);
    }
});
