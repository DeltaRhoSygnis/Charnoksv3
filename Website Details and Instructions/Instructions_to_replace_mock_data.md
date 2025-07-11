
# Guide: Connecting Sari POS to a Live Firebase Backend

This document provides step-by-step instructions for refactoring the Sari POS frontend to replace all mock data with real data fetched from a live Firebase project.

---

### Step 1: Set Up Firebase and Configuration

1.  **Create a Firebase Project:** If you haven't already, create a new project in the [Firebase Console](https://console.firebase.google.com/).
2.  **Enable Services:** Enable **Authentication** (with Email/Password provider) and **Firestore Database**.
3.  **Get Config:** In your project's settings, find your Firebase configuration object.
4.  **Create Config File:** Create a new file at `src/firebaseConfig.ts` (if it doesn't exist) and initialize Firebase.

    ```typescript
    // src/firebaseConfig.ts
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";
    import { getAuth } from "firebase/auth";

    // Paste your config object here
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      // ...etc
    };

    const app = initializeApp(firebaseConfig);

    // Export the services you'll need throughout the app
    export const auth = getAuth(app);
    export const db = getFirestore(app);
    ```

---

### Step 2: Replace Mock Authentication (`useAuth.tsx`)

The current `hooks/useAuth.tsx` uses mock users and localStorage. It needs to be replaced with real Firebase authentication.

**Modify `hooks/useAuth.tsx`:**

-   Import the real `auth` object from `firebaseConfig`.
-   Import functions from `firebase/auth` like `onAuthStateChanged`, `signInWithEmailAndPassword`, `signOut`, `createUserWithEmailAndPassword`.
-   Use the `onAuthStateChanged` listener inside a `useEffect` hook to keep the user state in sync with Firebase's auth state.
-   Replace the mock `login`, `logout`, and `createWorker` functions with their real Firebase SDK counterparts.

---

### Step 3: Create Data Fetching Services

Instead of importing from `data/mockData.ts`, create new service files to encapsulate Firestore queries.

**Example: `services/firestoreService.ts`**

```typescript
// src/services/firestoreService.ts
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import type { Product, Sale, Expense } from '../types';

export async function getProducts(): Promise<Product[]> {
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
}

export async function getSales(count: number): Promise<Sale[]> {
    const salesCol = collection(db, 'sales');
    const q = query(salesCol, orderBy('date', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    // Note: Firestore Timestamps need to be converted to ISO strings for consistency with the app's types.
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate().toISOString(),
        } as Sale;
    });
}

// ... create similar functions for getExpenses(), getNotes(), etc.
```

---

### Step 4: Refactor Components to Fetch Live Data

Apply the following pattern to all pages and components that currently use mock data. This involves removing the mock data import, adding state for loading/error handling, and using `useEffect` to fetch data when the component mounts.

**Example: Refactoring `pages/ProductsPage.tsx`**

**Before (Using Mock Data):**

```typescript
// pages/ProductsPage.tsx

import React, { useState } from 'react';
import { mockProducts } from '../data/mockData'; // <-- Importing mock data
import type { Product } from '../types';

const ProductsPage: React.FC = () => {
    // State is initialized directly with mock data
    const [products, setProducts] = useState<Product[]>(mockProducts); 
    
    const handleProductAdd = (newProduct: Product) => {
        setProducts(prevProducts => [newProduct, ...prevProducts]);
    };
    
    // ... JSX returning <ProductForm /> and <ProductList />
};
```

**After (Fetching Real Data from Firestore):**

```typescript
// pages/ProductsPage.tsx

import React, { useState, useEffect } from 'react';
// import { mockProducts } from '../data/mockData'; // <-- REMOVE THIS
import { getProducts } from '../services/firestoreService'; // <-- IMPORT your new function
import type { Product } from '../types';
import Spinner from '../components/ui/Spinner';

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const [error, setError] = useState<string | null>(null); // Add error state

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetchedProducts = await getProducts();
                setProducts(fetchedProducts);
            } catch (err) {
                setError("Failed to load products. Please try again later.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []); // Empty dependency array means this runs once when the component mounts

    const handleProductAdd = (newProduct: Product) => {
        // In a real app, the form would call a backend function.
        // For now, we can just update the UI optimistically.
        setProducts(prevProducts => [newProduct, ...prevProducts]);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }
    
    if (error) {
        return <div className="bg-red-900/20 text-red-300 text-center p-4 rounded-lg">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <header className="animate-bounce-in">
                <h1 className="text-4xl font-bold text-text-primary">Product Management</h1>
                <p className="text-text-secondary mt-1">Add new items to your inventory and view existing stock.</p>
            </header>
            
            {/* The form will need to be updated to call a backend function on submit */}
            <ProductForm onProductAdd={handleProductAdd} />

            {/* ProductList now receives live data */}
            <ProductList products={products} />
        </div>
    );
};
```

**Apply this refactoring pattern to the following files:**

-   `pages/Ownersdashboard.tsx`
-   `pages/AnalysisPage.tsx` (and its sub-components)
-   `pages/AIAssistantPage.tsx`
-   `pages/SalesPage.tsx`
-   `pages/ExpensesPage.tsx`
-   `pages/TransactionsPage.tsx`
-   `pages/NotesPage.tsx`
-   `pages/StockManagementPage.tsx`
