# Guide: Using Real Data in Your Sari POS App

You've asked a great question about the data used throughout the application. This guide will explain where it comes from and how you can replace it with your own real business data.

## 1. Where Does the Current Data Come From?

All the data you see—sales, products, expenses, worker names, etc.—is **mock (or sample) data**. It's placeholder information created for demonstration and development purposes.

This allows you to see how the app looks and functions without needing to connect to a live database first.

The file containing all this mock data is located at:
`data/mockData.ts`

Inside this file, you'll find arrays of objects for `mockProducts`, `mockSales`, `mockExpenses`, and so on. These are generated to simulate a real store's activity.

## 2. How to Replace Mock Data with Your Real Data

You should **not** manually edit the `data/mockData.ts` file with your real information. Instead, the correct approach is to connect the application to a persistent database, like **Firebase Firestore**, and fetch your data from there.

Here is a step-by-step guide on how to make this transition:

### Step 1: Set Up Your Backend (e.g., Firebase Firestore)

Before you can display real data, you need a place to store it.
1.  Create a Firebase project at [firebase.google.com](https://firebase.google.com/).
2.  Set up Firestore, which is a flexible, scalable NoSQL database.
3.  Populate your Firestore collections (`products`, `sales`, `expenses`, etc.) with your actual business data. Make sure the structure of your data in Firestore matches the interfaces defined in the `types.ts` file.

### Step 2: Create Data Fetching Functions

Instead of importing mock data, you'll create functions to fetch live data from your backend. You would typically add these to a new service file, for example, `services/firestoreService.ts`.

Here's an example of what a function to get products might look like (this is conceptual and requires setting up the Firebase SDK):

```typescript
// In a new file, e.g., 'services/firestoreService.ts'
import { firestore } from './firebaseConfig'; // Your Firebase configuration
import { collection, getDocs } from 'firebase/firestore';
import type { Product } from '../types';

export async function getProductsFromFirestore(): Promise<Product[]> {
  const productsCol = collection(firestore, 'products');
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  return productList;
}

// You would create similar functions for getSales, getExpenses, etc.
```

### Step 3: Update Your Components to Use Real Data

Now, you need to go into the page components and replace the mock data imports with calls to your new data fetching functions. This is typically done inside a `useEffect` hook.

Here’s an example for the `ProductsPage.tsx` component:

**Before (Using Mock Data):**

```typescript
// pages/ProductsPage.tsx

import React, { useState } from 'react';
import { mockProducts } from '../data/mockData'; // <-- Importing mock data
import type { Product } from '../types';

const ProductsPage: React.FC = () => {
    // State is initialized directly with mock data
    const [products, setProducts] = useState<Product[]>(mockProducts); 
    
    // ... rest of the component
};
```

**After (Fetching Real Data):**

```typescript
// pages/ProductsPage.tsx

import React, { useState, useEffect } from 'react';
// import { mockProducts } from '../data/mockData'; // <-- REMOVE this import
import { getProductsFromFirestore } from '../services/firestoreService'; // <-- IMPORT your new function
import type { Product } from '../types';
import Spinner from '../components/ui/Spinner';

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState<string | null>(null); // Add error state

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetchedProducts = await getProductsFromFirestore();
                setProducts(fetchedProducts);
            } catch (err) {
                setError("Failed to load products.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []); // Empty dependency array means this runs once when the component mounts

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }
    
    if (error) {
        return <div className="text-red-400 text-center">{error}</div>;
    }

    // ... rest of the component, now using the 'products' state which is filled with real data
};
```

You would apply this same pattern to all other pages that use mock data (`Ownersdashboard.tsx`, `AnalysisPage.tsx`, `AIAssistantPage.tsx`, etc.).

## 3. Should You Delete `data/mockData.ts`?

**No, not immediately.**

It's highly recommended to **keep the `data/mockData.ts` file** during development. It's very useful for:
*   **Offline Development:** Work on the UI without needing an internet connection.
*   **Testing:** Test new features with a predictable dataset without altering your live data.
*   **Reference:** It serves as a clear example of the data structure the app expects.

Once your backend integration is fully complete and stable across the entire application, you can then choose to delete the file if you wish. But until then, it remains a valuable development tool.
