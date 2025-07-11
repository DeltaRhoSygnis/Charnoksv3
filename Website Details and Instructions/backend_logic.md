
# Sari POS: Backend Logic & Architecture Guide

This document outlines the backend architecture and server-side logic required to power the Sari POS application in a production environment. The proposed architecture uses a serverless approach with **Google Firebase** to ensure scalability, security, and ease of management.

---

## 1. Core Platform: Google Firebase

Firebase provides a comprehensive suite of tools that map directly to the application's needs:
-   **Firebase Authentication:** For secure user login and role management.
-   **Firestore:** A NoSQL database for storing all application data in real-time.
-   **Cloud Functions for Firebase:** For running server-side logic (e.g., processing sales, calling AI APIs).
-   **Firebase Storage:** For storing user-uploaded content like product images.

---

## 2. Authentication & User Roles

The mock `useAuth` hook needs to be replaced with a real Firebase Authentication implementation.

### Workflow:
1.  **User Sign-up/Login:** The frontend uses the Firebase Auth SDK to handle user registration and login with email and password.
2.  **Managing Roles (Custom Claims):** Roles (`owner`, `worker`) are critical for security. The best practice is to use **Firebase Custom Claims**.
    -   When a new user signs up, a Cloud Function (`onUserCreate`) is triggered. This function can assign a default role (e.g., `worker`).
    -   An `owner` can have an interface in the app (or a separate admin tool) to change a user's role. This action would call a secure Cloud Function that sets the custom claim for that user's UID (e.g., `setCustomUserClaims(uid, { role: 'owner' })`).
3.  **Frontend Access Control:** When a user logs in, the frontend gets their ID Token. This token contains the custom claims, allowing the app to reliably check the user's role (`user.getIdTokenResult()`) and grant access to specific routes and UI elements.

---

## 3. Firestore Database Structure

A well-designed database structure is essential for performance and scalability. Here are the proposed collections:

-   `users`:
    -   Doc ID: `user.uid`
    -   Fields: `{ name: string, email: string, role: string, branchId: string }`
-   `products`:
    -   Doc ID: auto-generated
    -   Fields: `{ name: string, price: number, stock: number, category: string, imageUrl: string }`
-   `sales`:
    -   Doc ID: auto-generated
    -   Fields: `{ date: Timestamp, workerId: string, workerName: string, items: Array<{ productId: string, name: string, quantity: number, price: number }>, total: number, payment: number, change: number }`
-   `expenses`:
    -   Doc ID: auto-generated
    -   Fields: `{ date: Timestamp, workerId: string, description: string, amount: number }`
-   `notes`:
    -   Doc ID: auto-generated
    -   Fields: `{ date: Timestamp, category: string, title: string, description: string, amount?: number }`
-   `inventoryLogs`:
    -   Doc ID: auto-generated
    -   Fields: `{ date: Timestamp, type: 'received' | 'processed' | 'delivered', details: object, userId: string }` (For auditing stock changes).

---

## 4. Core Backend Workflows (Cloud Functions)

Business logic should be handled by server-side Cloud Functions to ensure data integrity and security. These would typically be **HTTPS Callable Functions**.

### a. `recordSale` Function
This is the most critical workflow. It must be a **transaction** to prevent data corruption (e.g., selling an item that just went out of stock).

1.  **Trigger:** Frontend calls this function with the cart items and payment details.
2.  **Process:**
    -   The function starts a Firestore transaction.
    -   For each item in the cart, it reads the corresponding product document to check the current `stock`.
    -   **Validation:** It verifies if `stock >= quantity` for all items. If not, the transaction fails and returns an "out of stock" error.
    -   **Write Operations:**
        -   It creates a new document in the `sales` collection with all the sale details.
        -   It updates the `stock` field (decrementing it) for each product document.
    -   The function commits the transaction. If any step fails, all changes are automatically rolled back.
3.  **Return:** A success or error message to the frontend.

### b. `addProduct` Function
1.  **Trigger:** Frontend calls this function after the user uploads an image to Firebase Storage.
2.  **Input:** Product details (name, price, etc.) and the `imageUrl` from Firebase Storage.
3.  **Process:** The function creates a new document in the `products` collection.

### c. `recordExpense` Function
1.  **Trigger:** Frontend calls this function with the expense details.
2.  **Process:** The function adds the `workerId` from the authenticated user context and creates a new document in the `expenses` collection.

---

## 5. Secure AI Integration (Gemini API Proxy)

**Never expose your Gemini API key on the frontend.** All AI calls must be proxied through a secure Cloud Function.

### `getAIAssistantResponse` Cloud Function
1.  **Trigger:** The frontend `AIAssistantPage` calls this HTTPS Callable Function with the user's `query` and the `chatHistory`.
2.  **Security:** The function automatically knows the authenticated `user.uid` and their role from the context.
3.  **Data Fetching:** The function queries Firestore to get relevant, up-to-date data (e.g., the last 50 sales, product list). This is more efficient and secure than sending all data from the client.
4.  **Prompt Construction:** It builds a detailed system prompt, including the fetched business data, and appends the user's query.
5.  **API Call:** Using the **server-side** `@google/genai` SDK, the function calls the Gemini API with the API key stored securely as a Firebase environment variable (or in Secret Manager).
6.  **Return:** The function sends Gemini's text response back to the frontend.

This same proxy pattern would be used for all other AI features (`getSalesForecast`, `parseSaleFromVoice`, etc.), making `services/geminiService.ts` on the frontend much simpler—it would only be responsible for calling these Cloud Functions.

---

## 6. Firestore Security Rules (`firestore.rules`)

Security rules are the final layer of defense, controlling data access directly at the database level.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check user role from auth token
    function isRole(role) {
      return request.auth.token.role == role;
    }

    // Owners can do anything
    match /{document=**} {
      allow read, write: if isRole('owner');
    }

    // Rules for workers
    match /products/{productId} {
      allow read: if isRole('worker');
    }

    match /sales/{saleId} {
      // Workers can only create sales under their own ID
      allow create: if isRole('worker') && request.resource.data.workerId == request.auth.uid;
      // Workers cannot update or delete sales
      allow update, delete: if false;
    }

    match /expenses/{expenseId} {
       // Workers can only create expenses under their own ID
      allow create: if isRole('worker') && request.resource.data.workerId == request.auth.uid;
      allow update, delete: if false;
    }
    
    // Default deny all other access for workers
  }
}
```

This ensures that even if the frontend code is compromised, a worker cannot access or modify data they are not authorized to.
