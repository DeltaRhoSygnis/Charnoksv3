# AI Prompt: Generate User Authentication & Role Management Backend

## 1. Goal

Your task is to generate the foundational **TypeScript** code for user authentication and role management in a Firebase project. This involves creating two essential Cloud Functions: one to assign a default role on user creation, and another for owners to change user roles.

---

## 2. Backend Requirements & Logic

### 2.1. User Roles
The system requires two roles defined via Firebase Custom Claims:
-   `owner`: Full administrative access.
-   `worker`: Default role with limited permissions.

### 2.2. `onUserCreate` (Auth-Triggered Function)
-   **Purpose:** To automatically initialize a new user's data and role.
-   **Trigger:** `functions.auth.user().onCreate()`
-   **Logic:**
    1.  When a new user account is created, this function must fire.
    2.  Set a default custom claim of `{ role: 'worker' }` for the new user using `admin.auth().setCustomUserClaims()`.
    3.  Create a corresponding document for the user in the `users` collection in Firestore. The document ID must be the user's `uid`.
    4.  The `users` document should store their `uid`, `email`, a default `displayName` (can be derived from the email or a placeholder), and the `role` ("worker").

### 2.3. `setUserRole` (HTTPS Callable Function)
-   **Purpose:** To allow an `owner` to elevate or change another user's role.
-   **Access Control:** The function must first verify that the caller is an authenticated user with the `owner` role. If not, it must throw an `unauthenticated` or `permission-denied` HttpsError.
-   **Request Body:**
    ```json
    {
      "targetUid": "the-uid-of-the-user-to-change",
      "newRole": "owner"
    }
    ```
-   **Logic:**
    1.  Verify the caller's `owner` role from their auth token (`context.auth.token.role`).
    2.  Use `admin.auth().setCustomUserClaims()` to set the `newRole` on the `targetUid`.
    3.  Update the `role` field in the target user's document in the `users` Firestore collection to reflect the change.
-   **Response:** On success, return `{ "success": true, "message": "User role updated successfully." }`.

---

## 3. Frontend Context for Implementation

These backend functions will be called or triggered based on actions in the following frontend components.

### File: `hooks/useAuth.tsx` (The mock implementation that needs to be replaced)
```typescript
import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';

// This would typically come from Firebase Auth, but we'll mock it for now.
interface User {
  uid: string;
  email: string;
  name: string;
  role: 'owner' | 'worker';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  createWorker: (name: string, email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_OWNER: User = {
    uid: 'owner-123',
    email: 'owner@charnoks.com',
    name: 'Mr. Charnok',
    role: 'owner',
};

const MOCK_WORKER: User = {
    uid: 'worker-1',
    email: 'worker@charnoks.com',
    name: 'John Doe',
    role: 'worker',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedUser = window.localStorage.getItem('auth-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Could not read user from localStorage", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            let userToLogin: User | null = null;
            if (email === MOCK_OWNER.email) {
                userToLogin = MOCK_OWNER;
            } else if (email === MOCK_WORKER.email) {
                userToLogin = MOCK_WORKER;
            }

            if (userToLogin && pass === 'password') { // Basic validation for mock
                try {
                    window.localStorage.setItem('auth-user', JSON.stringify(userToLogin));
                    setUser(userToLogin);
                    resolve();
                } catch (error) {
                    reject(new Error("Failed to save session."));
                }
            } else {
                reject(new Error("Invalid email or password."));
            }
             setLoading(false);
        }, 1500);
    });
  }, []);

  const logout = useCallback(() => {
    try {
        window.localStorage.removeItem('auth-user');
        setUser(null);
    } catch (error) {
        console.error("Could not remove user from localStorage", error);
    }
  }, []);

  const createWorker = useCallback(async (name: string, email: string, pass: string) => {
    // This function on the frontend would call the real `createUserWithEmailAndPassword`.
    // The `onUserCreate` trigger would then handle setting the role.
    console.log(`Creating worker: ${name} with email: ${email}`);
    await new Promise(res => setTimeout(res, 1000));
    return Promise.resolve();
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, createWorker }), [user, loading, login, logout, createWorker]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### File: `pages/SettingsPage.tsx` (Where an owner creates a new worker)
```typescript
import React, { useState } from 'react';
import ThemeSelector from '../components/ui/ThemeSelector';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';

const CreateWorkerForm: React.FC = () => {
    const { createWorker } = useAuth(); // In real app, this would be `createUserWithEmailAndPassword`
    // ... form state ...

    const handleSubmit = async (e: React.FormEvent) => {
        // ...
        // In a real app, this would call Firebase Auth to create a user.
        // The `onUserCreate` Cloud Function trigger would then handle the rest.
    };

    // ... rest of component
};
// ... rest of file
```

---

## 4. Your Task

Generate a single, complete **TypeScript** code file (`index.ts`) that contains the two specified Firebase Functions: `onUserCreate` and `setUserRole`. Ensure you include all necessary imports from `firebase-functions` and `firebase-admin`. The code must be well-structured, commented, and handle errors gracefully by throwing an `HttpsError` for the callable function.