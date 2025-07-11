
# Sari POS: Firestore Security Rules

These security rules are designed to protect the integrity of the Sari POS data by enforcing role-based access control. They ensure that users can only read or write data they are authorized to access.

-   **Owner:** Has full read/write access to all data.
-   **Worker:** Has limited access, primarily to read products and create sales/expenses under their own name.

Copy and paste the following into your `firestore.rules` file in the Firebase console.

---

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // --- Helper Functions ---
    // Check if the user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Check if the user has a specific role (from custom claims)
    function hasRole(role) {
      return isAuthenticated() && request.auth.token.role == role;
    }

    // Check if the incoming data belongs to the requesting user
    function isOwnerOfData(userIdField) {
      return isAuthenticated() && request.resource.data[userIdField] == request.auth.uid;
    }
    
    // --- Collection Rules ---

    // Users can read their own data. Owners can read any user's data.
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || hasRole('owner'));
      allow write: if hasRole('owner'); // Only owners can change roles
    }

    // Products can be read by any authenticated user. Only owners can create/update/delete.
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('owner');
    }

    // Sales can be created by workers for themselves. Only owners can read all sales.
    match /sales/{saleId} {
      allow read: if hasRole('owner');
      allow create: if hasRole('worker') && isOwnerOfData('soldBy');
      // Workers cannot update or delete past sales records.
      allow update, delete: if false;
    }

    // Expenses can be created by any authenticated user for themselves. Owners can read all.
    match /expenses/{expenseId} {
      allow read: if hasRole('owner');
      allow create: if isAuthenticated() && isOwnerOfData('recordedBy');
       // Workers cannot update or delete past expense records.
      allow update, delete: if false;
    }

    // Notes and Stock management are owner-only functionalities.
    match /notes/{noteId} {
      allow read, write: if hasRole('owner');
    }

    match /stocks/{stockId} {
      allow read, write: if hasRole('owner');
    }
  }
}
```
