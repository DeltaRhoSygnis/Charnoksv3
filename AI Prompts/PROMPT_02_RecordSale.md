# AI Prompt: Generate the `recordSale` Transactional Cloud Function

## 1. Goal

Your task is to generate a complete, production-ready **TypeScript** Firebase Cloud Function named `recordSale`. This function is the most critical piece of business logic in the application, as it handles sales transactions. It **must** be implemented using a Firestore Transaction to ensure data integrity.

---

## 2. Backend Requirements & Logic

### 2.1. Function Type & Access
-   **Type:** HTTPS Callable Function.
-   **Access:** Must be callable by authenticated users with either a `worker` or `owner` role.

### 2.2. Core Transactional Logic
The function must wrap all database reads and writes in a `runTransaction` block to prevent race conditions (e.g., selling a product that just went out of stock).

1.  **Initiate Transaction:** Start a Firestore transaction.
2.  **Validate Stock (Inside Transaction):**
    -   For each `item` in the incoming `items` array from the request:
        -   Use the transaction to read the corresponding product document from the `products` collection.
        -   Verify that the `product.stock` is greater than or equal to the requested `item.quantity`.
        -   If stock is insufficient for any item, you **must** throw an error to abort the entire transaction. The error message should be specific (e.g., "Out of stock for product 'Fried Chicken'.").
3.  **Perform Writes (Inside Transaction):**
    -   If stock for all items is sufficient, proceed with the write operations within the same transaction.
    -   **Update Product Stock:** For each item, update its document in the `products` collection, decrementing the `stock` by the `item.quantity`.
    -   **Create Sale Record:** Create a new document in the `sales` collection. This document must contain:
        -   `workerId`: The `uid` of the user calling the function (from `context.auth.uid`).
        -   `workerName`: The `displayName` of the user calling the function (from `context.auth.token.name`).
        -   `date`: A server-side `Timestamp`.
        -   `total`: The calculated total value of the sale.
        -   `payment`: The payment amount from the request.
        -   `change`: The calculated change (`payment` - `total`).
        -   `items`: A deep copy of the items array from the request, but with the `price` and `name` of each product included (fetched during the stock check) to create a historical record.
4.  **Commit Transaction:** The transaction will automatically commit upon successful completion of the block.

### 2.3. Request & Response
-   **Request Body:**
    ```json
    {
      "items": [
        { "productId": "firestore-doc-id-of-product-1", "quantity": 2 },
        { "productId": "firestore-doc-id-of-product-2", "quantity": 1 }
      ],
      "payment": 15.50
    }
    ```
-   **Success Response:**
    ```json
    { "success": true, "saleId": "newly-created-sale-doc-id" }
    ```
-   **Error Response:** The function should throw a `functions.https.HttpsError` with a relevant code (`invalid-argument`, `failed-precondition`, `unauthenticated`) and a clear error message.

---

## 3. Frontend Context for Implementation

This function will be called from the `handleSaveSale` method in `pages/SalesPage.tsx`.

### File: `pages/SalesPage.tsx`
```typescript
// Note how the cart state is structured. The backend function will receive a simplified version of this.
const SalesPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  // ... other state

  const handleSaveSale = useCallback(() => {
    if(cart.length === 0) return;
    
    // This is where the call to the `recordSale` Cloud Function will be made.
    // The `cart` object will be transformed to match the request body.
    const itemsForBackend = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
    }));
    const payload = {
        items: itemsForBackend,
        payment: parseFloat(moneyReceived)
    };
    
    // cloudFunctionCallable('recordSale')(payload);

    console.log("Saving Sale:", { cart, total, moneyReceived, change });
    // ... UI feedback
  }, [cart, total, moneyReceived, change]);

  // ... rest of component
};
```

### File: `types.ts`
```typescript
export interface Sale {
  id: string;
  date: string; // ISO string
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  workerId: string;
}

export interface Product {
  id:string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}
```

---

## 4. Your Task

Generate a single, complete **TypeScript** code block for the `recordSale` HTTPS Callable Firebase Function. The code must be robust, secure, and correctly implement the Firestore transaction as described. Include all necessary imports and clear comments explaining the transactional logic.