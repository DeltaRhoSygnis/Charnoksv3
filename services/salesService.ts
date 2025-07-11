import { 
    collection, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    Timestamp,
    doc,
    getDoc
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../src/firebaseConfig';

export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    imageUrl?: string;
}

export interface SaleItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface Sale {
    id: string;
    items: SaleItem[];
    total: number;
    payment: number;
    change: number;
    date: Timestamp;
    workerId: string;
}

// Record a sale
export async function recordSale(items: Omit<SaleItem, 'price'>[], payment: number): Promise<{ 
    success: boolean; 
    saleId: string; 
    total: number; 
    change: number; 
}> {
    const recordSaleFunction = httpsCallable(functions, 'recordSale');
    const result = await recordSaleFunction({ items, payment });
    return result.data as any;
}

// Get products with real-time updates
export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
    const q = query(collection(db, 'products'), orderBy('name'));
    
    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));
        callback(products);
    });
}

// Get sales with real-time updates
export function subscribeToSales(callback: (sales: Sale[]) => void): () => void {
    const q = query(collection(db, 'sales'), orderBy('date', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
        const sales = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Sale));
        callback(sales);
    });
}

// Get sales for a specific worker
export function subscribeToWorkerSales(workerId: string, callback: (sales: Sale[]) => void): () => void {
    const q = query(
        collection(db, 'sales'),
        where('workerId', '==', workerId),
        orderBy('date', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
        const sales = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Sale));
        callback(sales);
    });
}

// Get a single product
export async function getProduct(productId: string): Promise<Product | null> {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (!productDoc.exists()) return null;
    return {
        id: productDoc.id,
        ...productDoc.data()
    } as Product;
}

// Parse sale from voice input
export async function parseSaleFromVoice(transcript: string): Promise<{
    success: boolean;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
}> {
    const parseVoice = httpsCallable(functions, 'parseSaleFromVoice');
    const result = await parseVoice({ transcript });
    return result.data as any;
}

// Get AI assistant response
export async function getAIAssistantResponse(query: string, history: { sender: string; text: string; }[]): Promise<{
    response: string;
    timestamp: Timestamp;
}> {
    const getResponse = httpsCallable(functions, 'getAIAssistantResponse');
    const result = await getResponse({ query, history });
    return result.data as any;
}
