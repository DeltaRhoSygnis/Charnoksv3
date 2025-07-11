
# Sari POS: Backend API Specification

This document defines the REST API endpoints required for the Sari POS backend, intended to be implemented as **HTTPS Callable Firebase Functions**. Callable Functions are recommended as they automatically pass along the user's authentication context.

---

### Authentication

All endpoints require the user to be authenticated. The Firebase Function's `context` object will contain `context.auth` with the user's `uid` and custom claims (`role`).

---

### Endpoints

#### 1. Record a New Sale

-   **Endpoint:** `POST /api/sale`
-   **Description:** Records a new sales transaction. This function **must** use a Firestore transaction to update product stock and create the sale record atomically.
-   **Request Body:**
    ```json
    {
      "payment": 15.50,
      "items": [
        { "productId": "prod-1", "quantity": 2 },
        { "productId": "prod-3", "quantity": 1 }
      ]
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "saleId": "sale-doc-id-123",
      "message": "Sale recorded successfully."
    }
    ```
-   **Error Response (400 Bad Request / 500 Internal Server Error):**
    ```json
    {
      "success": false,
      "error": "Out of stock for product 'Fried Chicken'."
    }
    ```

#### 2. Record a New Expense

-   **Endpoint:** `POST /api/expense`
-   **Description:** Records a new business expense.
-   **Request Body:**
    ```json
    {
      "amount": 75.25,
      "description": "Payment for new cooking utensils."
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "expenseId": "expense-doc-id-456",
      "message": "Expense recorded successfully."
    }
    ```
-   **Error Response (400 Bad Request):**
    ```json
    {
      "success": false,
      "error": "Invalid amount provided."
    }
    ```

#### 3. Get Dashboard Analysis

-   **Endpoint:** `GET /api/analysis/dashboard`
-   **Description:** Fetches aggregated data for the owner's dashboard (e.g., total revenue, profit, top products for the last 30 days).
-   **Request Body:** (None)
-   **Success Response (200 OK):**
    ```json
    {
      "totalRevenue": 12540.50,
      "netProfit": 4320.75,
      "transactions": 850,
      "salesTrend": [
        { "name": "Oct 1", "sales": 400 },
        { "name": "Oct 2", "sales": 520 }
      ],
      "topProducts": [
        { "name": "Fried Chicken", "value": 3400 },
        { "name": "Burger", "value": 2100 }
      ]
    }
    ```

#### 4. Get Worker Performance

-   **Endpoint:** `GET /api/worker/:id/performance?range=30d`
-   **Description:** Fetches performance data for a specific worker over a given time range (`7d`, `30d`, `90d`). Owner-only access.
-   **Request Body:** (None)
-   **Success Response (200 OK):**
    ```json
    {
      "workerId": "worker-uid-123",
      "workerName": "John Doe",
      "totalSales": 1500.00,
      "totalExpenses": 150.00,
      "netProfit": 1350.00,
      "transactions": 120
    }
    ```

#### 5. Gemini AI Assistant Proxy

-   **Endpoint:** `POST /api/ai/assistant`
-   **Description:** Securely proxies requests to the Gemini API for the AI Assistant feature.
-   **Request Body:**
    ```json
    {
      "query": "What was my most profitable product this month?",
      "history": [
        { "sender": "user", "text": "Hi there!" },
        { "sender": "ai", "text": "Hello! How can I help?" }
      ]
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "response": "Based on the data, your most profitable product this month was 'Fried Chicken', contributing $850 to your net profit."
    }
    ```
