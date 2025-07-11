
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
        1.  When a new user account is created via Firebase Authentication, this function fires.
        2.  It sets a **default custom claim** of `{ role: 'worker' }` for the new user.
        3.  It creates a corresponding document for the user in the `users` collection in Firestore, storing their `uid`, `email`, and default `displayName`.

2.  **`setUserRole` (HTTPS Callable Function)**
    -   **Access Control:** Must be callable only by authenticated users with the `owner` role.
    -   **Request Body:**
        ```json
        {
          "targetUid": "uid-of-user-to-change",
          "newRole": "owner"
        }
        ```
    -   **Logic:**
        1.  Verify the caller is an `owner`.
        2.  Set the specified custom claim (`newRole`) on the `targetUid`.
        3.  Update the `role` field in the target user's document in the `users` collection in Firestore.
    -   **Response:** `{ "success": true, "message": "User role updated successfully." }`

---

## 4. Firestore Database Schema

The following schema must be implemented in Firestore. Use server-side `Timestamp` for all date/time fields.

### `users` collection
-   **Doc ID:** `user.uid`
-   **Fields:**
    -   `uid`: (string) User's unique ID.
    -   `email`: (string) User's email address.
    -   `displayName`: (string) User's full name.
    -   `role`: (string) Must be `"owner"` or `"worker"`.
    -   `createdAt`: (Timestamp) Server timestamp of account creation.

### `products` collection
-   **Doc ID:** Auto-generated
-   **Fields:**
    -   `name`: (string) Product name.
    -   `price`: (number) Selling price.
    -   `stock`: (number) Current inventory count. Must be an integer.
    -   `category`: (string) Product category.
    -   `imageUrl`: (string) Public URL of the product image from Firebase Storage.
    -   `isActive`: (boolean) To allow soft deletes.
    -   `createdAt`: (Timestamp) Server timestamp.

### `sales` collection
-   **Doc ID:** Auto-generated
-   **Fields:**
    -   `workerId`: (string) The `uid` of the worker who made the sale.
    -   `workerName`: (string) The `displayName` of the worker.
    -   `date`: (Timestamp) Server timestamp of the sale.
    -   `total`: (number) Total value of the sale.
    -   `payment`: (number) Amount received from the customer.
    -   `change`: (number) `payment` - `total`.
    -   `items`: (Array<Map>) An array of product objects sold.
        -   `productId`: (string) Firestore ID of the product.
        -   `name`: (string) Product name at time of sale.
        -   `quantity`: (number) Quantity sold.
        -   `price`: (number) Price per unit at time of sale.

### `expenses` collection
-   **Doc ID:** Auto-generated
-   **Fields:**
    -   `workerId`: (string) The `uid` of the user who recorded the expense.
    -   `date`: (Timestamp) Server timestamp.
    -   `amount`: (number) Expense amount.
    -   `description`: (string) Description of the expense.

### `notes` collection
-   **Doc ID:** Auto-generated
-   **Fields:**
    -   `authorId`: (string) `uid` of the owner who created the note.
    -   `date`: (Timestamp) Server timestamp.
    -   `category`: (string) e.g., 'Reminder', 'Supply Cost'.
    -   `title`: (string) Note title.
    -   `description`: (string) Note content.
    -   `amount`: (number, optional) Associated cost.

### `inventoryLogs` collection
-   **Doc ID:** Auto-generated
-   **Fields:**
    -   `date`: (Timestamp) Server timestamp.
    -   `type`: (string) `"received"`, `"processed"`, or `"delivered"`.
    -   `userId`: (string) `uid` of the user performing the action.
    -   `details`: (Map) A map containing context-specific data (e.g., `{ supplier: "...", quantity: 50 }` for `received`, or `{ branchId: "...", items: [...] }` for `delivered`).

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
        -   Create a new document in the `sales` collection with the sale details. The `workerId` and `workerName` should be taken from the caller's auth context.
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

### 5.4. `getOwnerDashboard`
-   **Access:** `owner` only.
-   **Logic:**
    1.  Fetch sales and expenses from the last 30 days.
    2.  Aggregate data to calculate Total Revenue, Net Profit, Transaction Count.
    3.  Aggregate sales by day for the sales trend chart.
    4.  Aggregate sales by product to find the Top 5 products by revenue.
-   **Response:** An object containing all the aggregated data for the dashboard KPIs and charts.

### 5.5. Gemini API Proxy Functions
-   **Access:** `owner` only for all AI functions.
-   **Security:** The Gemini API key MUST be loaded from environment configuration or Secret Manager. **Do not hardcode it.**
-   **General Logic:**
    1.  Verify the caller is an `owner`.
    2.  Fetch necessary, up-to-date data from Firestore based on the user's query context.
    3.  Construct a detailed prompt (system instruction + data + user query).
    4.  Call the `@google/genai` SDK with the `gemini-2.5-flash` model.
    5.  Return the `response.text`.

#### 5.5.1. `getAIAssistantResponse`
-   **Logic:** Fetches latest sales, expenses, and product list to provide context for a conversational chat response.
-   **Request:** `{ query: string, history: [{ text: string, sender: 'user' | 'ai' }] }`
-   **Response:** `{ response: string }`

#### 5.5.2. `getSalesForecast`
-   **Logic:**
    1.  Fetches sales data from the last 30-90 days.
    2.  Sends the data to Gemini with a prompt asking for a 7-day forecast.
    3.  Use `responseSchema` to enforce a JSON array output.
-   **Request:** `{}`
-   **Response:** `{ forecast: [{ day: string, predictedSales: number }] }`

#### 5.5.3. `parseSaleFromVoice`
-   **Access:** Authenticated `worker` or `owner`.
-   **Logic:**
    1.  Fetches the current list of product names from Firestore.
    2.  Sends the transcript and product list to Gemini.
    3.  Uses a strict `responseSchema` to get structured JSON back.
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
    match /inventoryLogs/{logId} { allow read, write: if false; }
    match /users/{userId} { allow read, write: if false; }
  }
}
```

---

## 7. Setup & Deployment

-   Configure Firebase Functions to use TypeScript and the Node.js 20 runtime.
-   Set the `GEMINI_API_KEY` as an environment variable for the Cloud Functions using `firebase functions:config:set gemini.key="YOUR_API_KEY"`.
-   Deploy using the `firebase deploy --only functions,firestore:rules` command.
