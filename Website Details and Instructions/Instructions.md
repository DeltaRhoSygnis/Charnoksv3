
# Guide: Connecting Sari POS to a Live Firebase Backend

This document provides step-by-step instructions for replacing the mock data in the Sari POS application with real data from a Firebase project.

---

### Step 1: Set Up Your Firebase Project

1.  **Create a Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Services:**
    -   **Authentication:** Go to the "Authentication" section, click "Get started," and enable the "Email/Password" sign-in method.
    -   **Firestore Database:** Go to the "Firestore Database" section, click "Create database," and start in **production mode**.
3.  **Get Config:** In your project's settings, find your Firebase configuration object. It will look like this:
    ```javascript
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "...",
      appId: "..."
    };
    ```

### Step 2: Integrate Firebase into the React App

1.  **Create a Config File:** Create a new file at `src/firebaseConfig.ts`.
2.  **Initialize Firebase:** Add your config object to this file and initialize Firebase.
    ```typescript
    // src/firebaseConfig.ts
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";
    import { getAuth } from "firebase/auth";

    const firebaseConfig = {
      // Paste your config object here
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Export the services you'll need
    export const auth = getAuth(app);
    export const db = getFirestore(app);
    ```

### Step 3: Replace the Mock Authentication Hook

The current app uses a mock authentication system in `hooks/useAuth.tsx`. You need to replace this with real Firebase authentication.

**Modify `hooks/useAuth.tsx`:**

```typescript
// hooks/useAuth.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebaseConfig'; // Import real auth
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  User 
} from 'firebase/auth';

interface AuthContextType {
  user: User | null; // Use the real Firebase User type
  loading: boolean;
  // login and logout methods will now call Firebase
}

// ... (rest of the provider)

// Inside the AuthProvider component:
useEffect(() => {
    // This listener will update the user state automatically
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
    });
    return unsubscribe; // Cleanup subscription on unmount
}, []);

const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

const logout = () => {
    return signOut(auth);
};
```
*Note: You will also need to implement logic to retrieve and manage custom claims for roles.*

### Step 4: Fetch Real Data in Components

Now, replace the static mock data imports with asynchronous calls to Firestore inside your components.

**Example: Modifying `pages/ProductsPage.tsx`**

**Before (Mock Data):**
```typescript
import { mockProducts } from '../data/mockData';

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    // ...
};
```

**After (Real Firestore Data):**
```typescript
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // Import Firestore instance
import { collection, getDocs } from 'firebase/firestore';
import type { Product } from '../types';
import Spinner from '../components/ui/Spinner';

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Product[];
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching products: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []); // Empty dependency array ensures this runs once on mount

    if (isLoading) {
        return <div className="text-center p-8"><Spinner size="lg" /></div>;
    }

    // ... rest of the component (ProductList, ProductForm, etc.)
    // They will now receive and display real data.
};
```

Apply this `useEffect` data-fetching pattern to all other pages that currently use mock data, such as `Ownersdashboard.tsx`, `TransactionsPage.tsx`, `AIAssistantPage.tsx`, etc.
