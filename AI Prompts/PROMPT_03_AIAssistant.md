# AI Prompt: Generate the Secure AI Assistant Proxy Function

## 1. Goal

Your task is to generate a complete, production-ready **TypeScript** Firebase Cloud Function named `getAIAssistantResponse`. This function will act as a **secure server-side proxy** for all requests to the Google Gemini API for the AI Assistant chat feature.

**Key Requirement:** The Gemini API key must **never** be exposed on the client side. This function is the secure gateway.

---

## 2. Backend Requirements & Logic

### 2.1. Function Type & Access
-   **Type:** HTTPS Callable Function.
-   **Access:** Must be callable **only** by authenticated users with the `owner` role. The function must verify this at the start and throw a `permission-denied` error if the caller is not an owner.

### 2.2. Secure Proxy Logic
1.  **Authenticate & Authorize:** Check `context.auth.token.role` to ensure the caller is an `owner`.
2.  **Fetch Live Data from Firestore:** Before calling the AI, the function must fetch fresh business data from Firestore to provide as context. This is more secure and reliable than trusting data sent from the client.
    -   Query the `sales` collection for the last 50 sales.
    -   Query the `expenses` collection for the last 20 expenses.
    -   Query the `products` collection for the complete list of products.
3.  **Prompt Engineering:** Construct a detailed prompt for the Gemini `gemini-2.5-flash` model.
    -   **System Instruction:** Create a comprehensive `systemInstruction` that defines the AI's persona and capabilities. It should state that it is a business assistant for "Sari POS", that it should answer questions based *only* on the provided data, and that it should format answers with markdown.
    -   **Data Context:** Add the fetched data (sales, expenses, products) to the prompt, likely formatted as a compact JSON string within the system instruction.
    -   **Chat History:** Format the `history` from the request body into the format expected by the Gemini API (`role: 'user'` or `role: 'model'`).
    -   **User Query:** Add the user's current `query` as the final message in the `contents` array.
4.  **Call Gemini API:**
    -   Use the **server-side** `@google/genai` SDK.
    -   Initialize the SDK using an API key stored securely in Firebase environment variables (e.g., `process.env.GEMINI_API_KEY`). **Do not hardcode the key.**
    -   Call `ai.models.generateContent()` with the constructed prompt.
5.  **Return Response:** Return the `response.text` from the Gemini API call back to the client.

### 2.3. Request & Response
-   **Request Body:**
    ```json
    {
      "query": "What were my top selling products this week?",
      "history": [
        { "sender": "user", "text": "Hi there!" },
        { "sender": "ai", "text": "Hello! How can I help?" }
      ]
    }
    ```
-   **Success Response:**
    ```json
    {
      "response": "Based on my analysis, your top selling product this week was **Fried Chicken**."
    }
    ```
-   **Error Response:** The function should throw a `functions.https.HttpsError` for auth failures or if the Gemini API call fails.

---

## 3. Frontend Context for Implementation

This function will be called by the `handleSendMessage` function in `pages/AIAssistantPage.tsx`, replacing the direct client-side call in `services/geminiService.ts`.

### File: `pages/AIAssistantPage.tsx`
```typescript
import React, { useState, useEffect, useRef } from 'react';
import ChatBubble from '../components/ai/ChatBubble';
import ChatInput from '../components/ai/ChatInput';
import PromptSuggestions from '../components/ai/PromptSuggestions';
// This import will be changed to a new service that calls the Cloud Function
import { getAIAssistantResponse } from '../services/geminiService'; 
import { mockSales, mockExpenses, mockProducts } from '../data/mockData';

// ...

const AIAssistantPage: React.FC = () => {
    // ... state management
    
    const handleSendMessage = async (query: string) => {
        if (!query.trim() || isLoading) return;

        // ... update messages state
        
        // This is where the call to the `getAIAssistantResponse` Cloud Function will be made.
        // The payload will match the request body defined above.
        // The mock data (mockSales, etc.) will no longer be passed from the client.
        try {
            // const responseText = await callCloudFunction('getAIAssistantResponse', { query, history: historyForAI });
            // ... handle response
        } catch (error: any) {
            // ... handle error
        } finally {
            setIsLoading(false);
        }
    };

    // ... rest of component
};

export default AIAssistantPage;
```

### File: `types.ts`
```typescript
export interface Sale { id: string; date: string; /*...*/ }
export interface Expense { id: string; date: string; /*...*/ }
export interface Product { id: string; name: string; /*...*/ }
```

---

## 4. Your Task

Generate a single, complete **TypeScript** code block for the `getAIAssistantResponse` HTTPS Callable Firebase Function. The code must implement the secure proxy pattern, fetch data from Firestore, construct a high-quality prompt for Gemini, and handle API key security correctly. Include all necessary imports and clear comments.