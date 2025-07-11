
# Technical Prompt: Engineering the Sari POS Firebase Backend

## 1. Project Mandate & Core Objective

You are tasked with building the complete server-side backend for **Sari POS**, a modern, AI-enhanced Point of Sale Progressive Web App. The backend must be secure, scalable, and implemented as a serverless architecture on Google Firebase.

The primary objective is to create a set of APIs (as Cloud Functions) that handle all business logic, data persistence, user authentication, and secure proxying of requests to the Google Gemini API. The system must support two distinct user roles: `owner` and `worker`, each with specific permissions.

---

## 2. Required Technology Stack

-   **Platform:** Google Firebase
-   **Services:**
    -   Firebase Authentication
    -   Firestore (as the primary database)
    -   Cloud Functions for Firebase (2nd gen or higher)
    -   Firebase Storage
    -   Google Secret Manager (for API keys)
-   **Language:** **TypeScript** for all Cloud Functions.
-   **Key Libraries:**
    -   `firebase-functions`
    -   `firebase-admin`
    -   `@google/genai` (for server-side Gemini API calls)

---

## 3. Authentication & Authorization System

Implement a robust authentication system using Firebase Authentication and Custom Claims for role-based access control (RBAC).

### 3.1. User Roles

-   `owner`: Full administrative access to all data and features.
-   `worker`: Limited access, primarily for recording sales and expenses.

### 3.2. Cloud Functions for User Management

Create the following Cloud Functions to manage users and roles:

1.  **`onUserCreate` (Auth Triggered Function)**
    -   **Trigger:** `functions.auth.user().onCreate()`
    -   **Logic:**
        1.  When a new user account is created, this function fires.
        2.  It sets a **default custom claim** of `{ role: 'worker' }` for the new user.
        3.  It creates a corresponding document for the user in the `users` collection in Firestore.

2.  **`setUserRole` (HTTPS Callable Function)**
    -   **Access Control:** Must be callable only by authenticated users with the `owner` role.
    -   **Request Body:** `{ "targetUid": "uid-of-user-to-change", "newRole": "owner" | "worker" }`
    -   **Logic:**
        1.  Verify the caller is an `owner`.
        2.  Set the specified custom claim (`newRole`) on the `targetUid`.
        3.  Update the `role` field in the target user's document in the `users` collection.
    -   **Response:** `{ "success": true, "message": "User role updated successfully." }`

---

## 4. Firestore Database Schema

The following schema must be implemented in Firestore. Use server-side `Timestamp` for all date/time fields.

### `users` collection
-   **Doc ID:** `user.uid`
-   **Example Document:**
    ```json
    {
      "uid": "user-uid-from-auth",
      "email": "worker@charnoks.com",
      "name": "John Doe",
      "role": "worker",
      "createdAt": "Timestamp"
    }
    ```

### `products` collection
-   **Doc ID:** Auto-generated
-   **Example Document:**
    ```json
    {
      "name": "Fried Chicken",
      "price": 2.50,
      "stock": 100,
      "category": "Meals",
      "imageUrl": "https://...",
      "createdAt": "Timestamp"
    }
    ```

### `sales` collection
-   **Doc ID:** Auto-generated
-   **Example Document:**
    ```json
    {
      "workerId": "worker-uid-123",
      "workerName": "John Doe",
      "date": "Timestamp",
      "total": 4.00,
      "payment": 5.00,
      "change": 1.00,
      "items": [
        { "productId": "prod-1", "name": "Fried Chicken", "quantity": 1, "price": 2.50 },
        { "productId": "prod-2", "name": "French Fries", "quantity": 1, "price": 1.50 }
      ]
    }
    ```

### `expenses` collection
-   **Doc ID:** Auto-generated
-   **Example Document:**
    ```json
    {
      "workerId": "worker-uid-123",
      "date": "Timestamp",
      "amount": 50.00,
      "description": "Supplier payment #1"
    }
    ```

### `notes` collection
-   **Doc ID:** Auto-generated
-   **Example Document:**
    ```json
    {
      "authorId": "owner-uid-456",
      "date": "Timestamp",
      "category": "Supply Cost",
      "title": "Chicken Supply - Batch 102",
      "description": "Payment for 50kg of fresh chicken from Farm Fresh Inc.",
      "amount": 350.50
    }
    ```

---

## 5. Firebase Cloud Functions API Specification

All functions must be **HTTPS Callable Functions** written in **TypeScript**.

### 5.1. `recordSale`
-   **Access:** Authenticated `worker` or `owner`.
-   **Logic:**
    1.  This function **MUST** use a **Firestore Transaction**.
    2.  Validate the request body (`items` array is not empty, `payment` is valid).
    3.  For each item in the `items` array:
        -   Read the product document from Firestore.
        -   Verify that `product.stock >= item.quantity`. If not, abort the transaction and throw an error.
    4.  If stock is sufficient for all items:
        -   Decrement the `stock` for each product document.
        -   Create a new document in the `sales` collection. The `workerId` and `workerName` must be taken from the caller's auth context.
    5.  Commit the transaction.
-   **Request:** `{ items: [{ productId: string, quantity: number }], payment: number }`
-   **Response:** `{ success: true, saleId: string }`

### 5.2. `recordExpense`
-   **Access:** Authenticated `worker` or `owner`.
-   **Logic:** Creates a new document in the `expenses` collection. `workerId` is from the auth context.
-   **Request:** `{ amount: number, description: string }`
-   **Response:** `{ success: true, expenseId: string }`

### 5.3. `addProduct`
-   **Access:** `owner` only.
-   **Logic:** Creates a new document in the `products` collection.
-   **Request:** `{ name: string, price: number, stock: number, category: string, imageUrl: string }`
-   **Response:** `{ success: true, productId: string }`

### 5.4. Gemini API Proxy Functions
-   **Access:** `owner` only for all AI functions (except voice parsing).
-   **Security:** The Gemini API key MUST be loaded from environment configuration or Secret Manager. **Do not hardcode it.**
-   **General Logic:**
    1.  Verify the caller's role.
    2.  Fetch necessary, up-to-date data from Firestore.
    3.  Construct a detailed prompt (system instruction + data + user query).
    4.  Call the `@google/genai` SDK with the `gemini-2.5-flash` model.
    5.  Return the `response.text` or parsed JSON.

#### 5.4.1. `getAIAssistantResponse`
-   **Access:** `owner` only.
-   **Logic:** Fetches latest sales, expenses, and product list to provide context for a conversational chat response.
-   **Request:** `{ query: string, history: [{ text: string, sender: 'user' | 'ai' }] }`
-   **Response:** `{ response: string }`

#### 5.4.2. `getSalesForecast`
-   **Access:** `owner` only.
-   **Logic:** Fetches sales data, sends it to Gemini asking for a 7-day forecast, and uses `responseSchema` to enforce a JSON array output.
-   **Request:** `{}`
-   **Response:** `{ forecast: [{ day: string, predictedSales: number }] }`

#### 5.4.3. `parseSaleFromVoice`
-   **Access:** Authenticated `worker` or `owner`.
-   **Logic:** Fetches current product names from Firestore, sends transcript and product list to Gemini, and uses a strict `responseSchema` to get structured JSON back.
-   **Request:** `{ transcript: string }`
-   **Response:** `{ items: [{ productName: string, quantity: number }], payment: number }`

---

## 6. Firestore Security Rules

Implement the following rules in `firestore.rules` to enforce the RBAC at the database level.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isOwner() {
      return request.auth.token.role == 'owner';
    }

    function isWorker() {
      return request.auth.token.role == 'worker';
    }

    function isOwnerOfData(userIdField) {
      return request.resource.data[userIdField] == request.auth.uid;
    }

    // Owners have god-mode access
    match /{document=**} {
      allow read, write: if isOwner();
    }

    // --- Worker Rules ---
    match /products/{productId} {
      allow read: if isWorker();
      allow write: if false; // Workers cannot modify products
    }

    match /sales/{saleId} {
      allow create: if isWorker() && isOwnerOfData('workerId');
      allow read, update, delete: if false; // Workers cannot view/edit past sales
    }

    match /expenses/{expenseId} {
      allow create: if isWorker() && isOwnerOfData('workerId');
      allow read, update, delete: if false;
    }

    // Workers cannot access these collections at all
    match /notes/{noteId} { allow read, write: if false; }
    match /users/{userId} { 
      allow read: if isWorker() && request.auth.uid == userId; // Allow worker to read their own user doc
      allow write: if false; 
    }
  }
}
```
