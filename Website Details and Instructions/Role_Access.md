
# Sari POS: Role-Based Access Control

This document clarifies which features and pages are accessible to each user role within the Sari POS application. This ensures a secure and streamlined experience tailored to the user's responsibilities.

---

## 1. Owner Role

The **Owner** has unrestricted access to all features and data within the application. Their primary focus is on business oversight, management, and strategic analysis.

### Accessible Pages & Features:

-   **✅ Login:** Can log in as an Owner.
-   **✅ Owner Dashboard:** Full access to view all KPIs (Total Revenue, Net Profit), sales charts, and top product analysis.
-   **✅ Analysis Center:**
    -   Can view all analysis modes.
    -   Can compare worker performance.
    -   Can view individual worker insights.
    -   Can access AI-powered predictions and insights.
-   **✅ AI Assistant:** Full access to the conversational AI for business queries.
-   **✅ Stock Management:** Can record stock received from suppliers, process it, and deliver it to branches. Can view stock levels at all branches.
-   **✅ Products:** Can add, view, update, and delete all products.
-   **✅ Expenses:** Can record new expenses and view a complete history of all expenses from all users.
-   **✅ Transactions:** Can view a complete history of all sales transactions from all workers.
-   **✅ Internal Log (Notes):** Can create, view, and manage all internal notes.
-   **✅ Settings:** Can change the application theme and manage other application-wide settings.

---

## 2. Worker Role

The **Worker** has a limited, focused set of permissions designed for operational efficiency. Their primary role is to handle daily sales and expenses.

### Accessible Pages & Features:

-   **✅ Login:** Can log in as a Worker.
-   **✅ Worker Dashboard:** Access to a simplified dashboard showing their **own** sales and revenue for the day.
-   **✅ Record Sale:** Full access to the `Record Sale` page.
    -   Can add products to the cart.
    -   Can use voice input to create a sale.
    -   Can process payments and save the sale.
-   **✅ Record Expense:** Can access the `Record Expense` page to log expenses they have incurred. They cannot see expenses logged by other users.
-   **✅ Settings:** Can change their own application theme.

### Restricted Access:

-   **❌ Owner Dashboard:** Cannot access.
-   **❌ Analysis Center:** Cannot access.
-   **❌ AI Assistant:** Cannot access.
-   **❌ Stock Management:** Cannot access.
-   **❌ Products:** Cannot add, edit, or delete products. (Can only view them in the `Record Sale` interface).
-   **❌ Transactions:** Cannot view the full transaction history page.
-   **❌ Internal Log (Notes):** Cannot access.
