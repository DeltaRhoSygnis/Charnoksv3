
# Sari POS: Google Gemini API Integration Plan

This document outlines the strategy for integrating the Google Gemini API (specifically `gemini-2.5-flash`) into the Sari POS backend. The primary goal is to provide powerful, AI-driven insights to the business owner securely and efficiently.

---

## 1. Core Principle: Server-Side Proxy

**The Gemini API key MUST remain on the server and never be exposed to the client-side application.**

All interactions with the Gemini API will be handled by a secure **Firebase Cloud Function** that acts as a proxy.

### Workflow:

1.  **Client Request:** The frontend (e.g., the AI Assistant page) calls a specific HTTPS Callable Cloud Function (e.g., `getAIAssistantResponse`).
2.  **Authentication:** The Cloud Function automatically receives the user's authentication context, verifying they are an authenticated 'owner'.
3.  **Data Aggregation:** The function queries the Firestore database in real-time to fetch the necessary, up-to-date data (e.g., recent sales, product lists, expense summaries).
4.  **Prompt Engineering:** The function constructs a detailed, well-structured prompt for the Gemini model. This includes:
    -   A **system instruction** defining the AI's role ("You are a helpful business assistant for Sari POS...").
    -   The **aggregated data** from Firestore, formatted as JSON.
    -   The **user's actual query**.
5.  **API Call:** The function uses the server-side `@google/genai` SDK to make a `generateContent` call to the Gemini API. The API key is securely accessed from Firebase environment variables or Google Secret Manager.
6.  **Response Handling:** The function receives the response from Gemini, performs any necessary formatting, and sends the final text back to the client.

---

## 2. Gemini Use Cases & Example Prompts

### a. AI Assistant (Conversational Q&A)

This feature allows the owner to ask natural language questions about their business.

-   **User Query:** "Which product is selling best this week and which is the worst?"
-   **Backend Action:**
    1.  The Cloud Function fetches sales data from the last 7 days.
    2.  It aggregates sales per product.
    3.  It constructs a prompt:
        ```
        System: You are a business analyst. Based on the JSON data, answer the user's question.
        Data: { "salesLast7Days": [{"productId": "prod-1", "total": 500}, {"productId": "prod-6", "total": 50}], "products": [...] }
        User: "Which product is selling best this week and which is the worst?"
        ```
-   **Expected AI Response:** "This week, 'Fried Chicken' was your top-selling product with $500 in revenue. Your lowest-selling product was 'Salad', with $50 in revenue."

### b. Net Profit Calculation

-   **User Query:** "What’s my net profit for today?"
-   **Backend Action:**
    1.  The Cloud Function fetches all sales and expenses with today's timestamp.
    2.  It calculates `totalSales - totalExpenses`.
    3.  It constructs a prompt:
        ```
        System: You are a helpful accountant.
        Data: { "totalSalesToday": 850, "totalExpensesToday": 120 }
        User: "What's my net profit for today?"
        ```
-   **Expected AI Response:** "Your net profit for today is $730. (Calculated from $850 in sales minus $120 in expenses)."

### c. Comparative Analysis

-   **User Query:** "Compare my sales this week vs last week."
-   **Backend Action:**
    1.  The Cloud Function fetches sales from the last 14 days and separates them into two 7-day periods.
    2.  It constructs a prompt:
        ```
        System: You are a data analyst. Compare the two periods and provide a summary.
        Data: { "salesThisWeek": 3500, "salesLastWeek": 3100 }
        User: "Compare my sales this week vs last week."
        ```
-   **Expected AI Response:** "You've had a good week! Your sales this week were $3,500, which is an increase of $400 (about 12.9%) compared to last week's $3,100."

### d. Voice-to-Sale Parsing (Structured JSON Output)

This is already implemented in the frontend's `geminiService` and should be moved to a Cloud Function. The function will use a `responseSchema` to ensure the AI returns clean JSON.

-   **User Transcript:** "Two burgers, one fries, and a soda, paid 10 dollars."
-   **Expected AI JSON Output:**
    ```json
    {
      "items": [
        { "productName": "Burger", "quantity": 2 },
        { "productName": "French Fries", "quantity": 1 },
        { "productName": "Soda", "quantity": 1 }
      ],
      "payment": 10
    }
    ```
