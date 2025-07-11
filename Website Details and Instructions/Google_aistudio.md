
# Sari POS: System Architecture Summary

This document provides a high-level overview of the entire Sari POS system, combining the frontend PWA, Firebase backend, and Gemini AI services into a cohesive architecture.

---

## 1. System Overview

Sari POS is a **Progressive Web App (PWA)** designed to be a comprehensive Point of Sale solution. It operates with a **mobile-first design** and is built on a **serverless architecture** using Google Firebase.

-   **Frontend:** A dynamic, responsive single-page application built with React and TypeScript.
-   **Backend:** A fully serverless backend powered by Google Firebase, handling authentication, database, and business logic.
-   **AI:** Intelligent features are provided by the **Google Gemini API**, accessed securely through the backend.

---

## 2. Core Components & Technologies

### Frontend

-   **Framework:** React 18+ with Hooks
-   **Styling:** Tailwind CSS with a custom, CSS variable-driven **theme system** for easy personalization.
-   **Key Features:**
    -   Role-based UI for **Owners** and **Workers**.
    -   Interactive dashboards with `recharts` for data visualization.
    -   An efficient `Record Sale` page with a custom number pad and **voice input** powered by the Web Speech API.
    -   An `AI Assistant` chat interface for owners.
-   **Pages:** Login, Worker Dashboard, Record Sale, Owner Dashboard, Analysis Center, AI Assistant, Product Management, Stock Management, Expenses, Transactions, Internal Log (Notes), and Settings.

### Backend (Firebase-Only)

-   **Authentication:** Firebase Authentication for secure user login and management. **Custom Claims** are used to enforce user roles (`owner`, `worker`).
-   **Database:** Firestore serves as the real-time NoSQL database for all application data (`users`, `products`, `sales`, etc.).
-   **Business Logic:** Firebase Cloud Functions (HTTPS Callable) host all server-side logic. This includes:
    -   Processing sales atomically (updating stock and creating records).
    -   Handling expense and product creation.
    -   Acting as a secure proxy for all Gemini API calls.
-   **Storage:** Firebase Storage for hosting user-uploaded content, such as product images.
-   **Security:** Firestore Security Rules provide the final layer of protection, ensuring data can only be accessed and modified according to a user's role.

---

## 3. Data & Logic Flow

The system is designed with a clear, secure flow of data from the user to the database and back.

1.  **Authentication:** A user logs in via the frontend, which communicates with Firebase Auth. A JWT with a custom `role` claim is returned to the client.
2.  **Authenticated Requests:** For any backend operation (e.g., recording a sale), the frontend makes a call to a Firebase Cloud Function. The user's JWT is automatically included in the request.
3.  **Server-Side Execution:** The Cloud Function verifies the user's role from the JWT.
    -   It performs the required business logic.
    -   It reads from or writes to the Firestore database, with all actions validated by Firestore Security Rules.
4.  **AI Integration Flow:**
    -   The client calls an AI-specific Cloud Function (e.g., `/api/ai/assistant`).
    -   The function fetches relevant, fresh data from Firestore.
    -   It constructs a prompt and calls the Gemini API using a secure, server-side API key.
    -   The AI's response is returned through the function to the client.

This architecture ensures that the application is secure, scalable, and maintainable, with a clear separation between the presentation layer (React) and the business logic/data layer (Firebase).
