
# Sari POS: Firestore Data Structure

This document outlines the recommended Firestore database schema for the Sari POS application. This structure is designed for scalability, performance, and to support the features built into the frontend.

---

### Collection: `users`

Stores information about authenticated users and their roles.

-   **Document ID:** `user.uid` (from Firebase Authentication)
-   **Fields:**
    -   `displayName` (string): The user's full name (e.g., "John Doe").
    -   `email` (string): The user's login email.
    -   `role` (string): User's role. Must be either `"owner"` or `"worker"`.
    -   `createdAt` (Timestamp): Server timestamp of when the user account was created.
    -   `branchId` (string, optional): If the business has multiple branches, this links a worker to a specific location.

---

### Collection: `products`

Contains all products available for sale.

-   **Document ID:** auto-generated
-   **Fields:**
    -   `name` (string): The name of the product (e.g., "Fried Chicken").
    -   `price` (number): The selling price of the product.
    -   `stock` (number): The current inventory quantity. This will be updated by sales transactions.
    -   `category` (string): The product category (e.g., "Meals", "Drinks").
    -   `imageUrl` (string): URL to the product image, hosted on Firebase Storage.
    -   `ownerId` (string): The UID of the owner who added the product, for multi-tenant scenarios.
    -   `createdAt` (Timestamp): When the product was added.

---

### Collection: `sales`

A log of all completed sales transactions.

-   **Document ID:** auto-generated
-   **Fields:**
    -   `soldBy` (string): The `uid` of the worker who processed the sale.
    -   `timestamp` (Timestamp): Server timestamp of when the sale occurred.
    -   `total` (number): The total amount of the sale.
    -   `payment` (number): The amount of money received from the customer.
    -   `change` (number): The change given back to the customer.
    -   `items` (Array<Map>): An array of maps, where each map represents a product sold in the transaction.
        -   `productId` (string): The ID of the product from the `products` collection.
        -   `name` (string): The name of the product at the time of sale.
        -   `quantity` (number): The quantity of this product sold.
        -   `price` (number): The price per unit at the time of sale.

---

### Collection: `expenses`

A log of all business expenses.

-   **Document ID:** auto-generated
-   **Fields:**
    -   `recordedBy` (string): The `uid` of the user who recorded the expense.
    -   `timestamp` (Timestamp): Server timestamp of when the expense was recorded.
    -   `amount` (number): The value of the expense.
    -   `description` (string): A detailed reason for the expense (e.g., "Supplier payment for cooking oil").

---

### Collection: `notes`

Stores internal logs, memos, and reminders for the business owner.

-   **Document ID:** auto-generated
-   **Fields:**
    -   `recordedBy` (string): The `uid` of the owner who created the note.
    -   `timestamp` (Timestamp): Server timestamp when the note was created.
    -   `title` (string): The title of the note.
    -   `body` (string): The main content of the note.
    -   `category` (string): The note category (e.g., "Reminder", "Supply Cost").
    -   `amount` (number, optional): An associated cost, if applicable.

---

### Collection: `stocks`

Tracks the movement of raw inventory from the supplier to branches.

-   **Document ID:** auto-generated
-   **Fields:**
    -   `productId` (string, reference): Reference to the raw material or product type.
    -   `type` (string): Type of transaction: `"in"` (from supplier) or `"out"` (to branch).
    -   `quantity` (number): The amount of stock moved (in kg, packs, etc.).
    -   `branch` (string, optional): The ID or name of the branch that received the stock (for `out` type).
    -   `supplier` (string, optional): The name of the supplier (for `in` type).
    -   `receivedAt` (Timestamp): Server timestamp for the transaction.
    -   `recordedBy` (string): The `uid` of the user who recorded the stock movement.
