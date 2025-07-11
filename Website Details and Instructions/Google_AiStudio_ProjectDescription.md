
# Sari POS: Project Description & Vision

This document provides a comprehensive overview of the Sari POS application. It is intended to give context to backend developers and AI models about the project's purpose, design, features, and technology stack.

---

## 1. Project Vision & Purpose

Sari POS is a modern, AI-enhanced **Progressive Web App (PWA)** designed as a complete Point of Sale solution for small businesses, such as a fried chicken stall.

-   **Vision:** To empower small business owners with a tool that is not only easy to use for daily operations but also provides powerful, AI-driven insights to help them understand and grow their business.
-   **Target Audience:**
    -   **Owners:** Business owners who need to manage inventory, track performance, analyze data, and make strategic decisions.
    -   **Workers:** Employees who need a fast, reliable, and intuitive interface to record sales and expenses.

---

## 2. Design Philosophy & UI/UX

The user interface is designed to be intuitive, visually appealing, and highly functional on both desktop and mobile devices.

### Core Principles

-   **Modern & Clean:** The UI prioritizes clarity with a minimalist aesthetic, reducing clutter and focusing on the task at hand.
-   **Glassmorphism:** The primary visual style uses blurred, semi-transparent backgrounds (`backdrop-blur`), subtle transparency, and soft shadows to create a sense of depth and hierarchy.
-   **Data-First:** The design emphasizes clear data presentation through prominent Key Performance Indicator (KPI) cards and intuitive charts.
-   **Responsive & Adaptive:** The layout is fully responsive, providing an optimal experience on any device.

### Theming System

-   **Technology:** A powerful and flexible theming system is built using CSS variables defined in `index.html`.
-   **Functionality:** Themes can be switched instantly across the entire application without a page reload. The `useTheme` hook manages this state.
-   **Animated Background:** A signature visual is the `animate-gradient-x` background, a large, multi-stop linear gradient that slowly animates, creating a subtle, premium ambiance.

### Layout

-   **Desktop:** A fixed sidebar on the left provides primary navigation.
-   **Mobile:** The sidebar is hidden in favor of a slide-out menu. The layout adapts to a single-column view for optimal use of vertical space.

---

## 3. Technology Stack

-   **Framework:** React 18+ with Hooks
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS with a custom CSS variable-based theming system.
-   **Routing:** `react-router-dom` (HashRouter) for client-side navigation.
-   **Charts & Visualization:** `recharts`.
-   **AI Integration:** `@google/genai` SDK for interacting with the Gemini API.
-   **Backend:** Google Firebase (Authentication, Firestore, Storage, Cloud Functions).

---

## 4. User Roles & Workflows

The application has two distinct user roles with different permissions and workflows.

### a. Owner Workflow

1.  **Login:** Logs in with owner credentials.
2.  **Dashboard (`Ownersdashboard`):** Views an at-a-glance summary of the entire business (total revenue, profit, sales trends, top products).
3.  **Analysis (`AnalysisPage`):** Dives deeper into data by comparing worker performance, viewing overall trends, or getting AI-powered sales forecasts and strategic insights.
4.  **Management:** Uses dedicated pages to manage `Products`, `Stock`, `Expenses`, `Transactions`, and internal `Notes`.
5.  **AI Assistant (`AIAssistantPage`):** Interacts with a conversational AI to ask complex questions about business performance.
6.  **Settings (`SettingsPage`):** Customizes the app's theme and creates new worker accounts.

### b. Worker Workflow

1.  **Login:** Logs in with worker credentials.
2.  **Dashboard (`WorkerDashboard`):** Views a simplified dashboard showing their personal sales and revenue for the day.
3.  **Record Sale (`SalesPage`):** Spends most of their time on this highly interactive page to record customer sales. They can tap products to add them to a cart or use voice input for hands-free operation.
4.  **Record Expense (`ExpensesPage`):** Records business-related expenses they have incurred.
5.  **Settings (`SettingsPage`):** Can change their personal theme preference.

---

## 5. AI Integration Plan

The Gemini API is a core part of the application's value, providing intelligent features. All AI calls will be securely proxied through the Firebase backend.

-   **AI Assistant:** A conversational chat interface that has context on the business's data to provide relevant answers.
-   **Sales Forecasting:** Generates a 7-day sales forecast based on historical data.
-   **Business Insights:** Provides high-level strategic advice (Opportunities, Risks).
-   **Voice-to-Sale Parsing:** Converts natural language from a user's voice into a structured JSON object for a sale, enabling fast, hands-free order entry.
