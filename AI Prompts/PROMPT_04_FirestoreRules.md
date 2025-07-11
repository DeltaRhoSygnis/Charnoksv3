# AI Prompt: Generate Firestore Security Rules for Sari POS

## 1. Goal

Your task is to generate a complete, robust, and secure `firestore.rules` file for the Sari POS application. These rules must enforce the specified role-based access control (RBAC) for all collections, ensuring data integrity and preventing unauthorized access.

---

## 2. Security Requirements & Logic

The rules must be written for `rules_version = '2';` and implement the following logic based on a user's custom auth claim (`request.auth.token.role`).

### 2.1. User Roles
-   `owner`: Has full read/write access to **all** data across the entire database. This is the "superuser" role.
-   `worker`: Has restricted access. Their permissions are defined on a per-collection basis.

### 2.2. Helper Functions
To keep the rules clean and readable, define helper functions for common checks:
-   `isOwner()`: Returns `true` if `request.auth.token.role == 'owner'`.
-   `isWorker()`: Returns `true` if `request.auth.token.role == 'worker'`.
-   `isOwnerOfData(userIdField)`: A function that checks if the `uid` of the requesting user matches the `uid` stored in a specific field of the document being written (e.g., `request.resource.data.workerId`).

### 2.3. Collection-Specific Rules

1.  **Global Rule (Owner Override):**
    -   An owner should be able to read and write any document in any collection. This can be implemented as a broad match (`match /{document=**}`).

2.  **`users` Collection:**
    -   **Read:** An authenticated user should be able to read their own document (`request.auth.uid == userId`). Owners can read any user document.
    -   **Write:** Only `owners` can write to any user document (e.g., to update a user's `displayName`).

3.  **`products` Collection:**
    -   **Read:** Any authenticated user (`worker` or `owner`) should be able to read the product list.
    -   **Write (`create`, `update`, `delete`):** Only `owners` can create, modify, or delete products.

4.  **`sales` Collection:**
    -   **Create:** A `worker` must be allowed to create a new sale document, but **only if** the `workerId` field in the new document matches their own `uid`.
    -   **Read, Update, Delete:** `workers` must be **denied** permission to read the sales collection directly or to update/delete any sale record. This is an owner-only privilege.

5.  **`expenses` Collection:**
    -   **Create:** A `worker` must be allowed to create a new expense document, but **only if** the `workerId` field in the new document matches their own `uid`.
    -   **Read, Update, Delete:** `workers` must be **denied** permission to read the expenses collection directly or to update/delete any expense record.

6.  **`notes` & `inventoryLogs` Collections:**
    -   These are owner-exclusive features. `workers` must be **denied** all (`read`, `write`) access to these collections.

---

## 3. Firestore Schema Context

The rules you generate will protect the following data structures.

-   **`users/{uid}`:** `{ uid, email, displayName, role }`
-   **`products/{productId}`:** `{ name, price, stock, ... }`
-   **`sales/{saleId}`:** `{ workerId, workerName, date, total, items, ... }`
-   **`expenses/{expenseId}`:** `{ workerId, date, amount, description }`
-   **`notes/{noteId}`:** `{ authorId, date, title, ... }`
-   **`inventoryLogs/{logId}`:** `{ date, type, userId, details }`

---

## 4. Your Task

Generate a single, complete `firestore.rules` file that implements all the security logic described above. The file must be well-structured, use helper functions, and include comments explaining the rules for each collection. Ensure there are no open security loopholes; by default, access should be denied unless explicitly allowed by one of your rules.