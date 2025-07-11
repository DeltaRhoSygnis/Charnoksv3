# Sari POS: Project Architecture & Design Document

This document serves as the comprehensive guide to the Sari POS application, detailing its vision, architecture, design principles, features, and data management strategy.

## 1. Project Vision & Purpose

Sari POS is a modern, AI-enhanced Progressive Web App (PWA) designed as a complete Point of Sale solution for small businesses.

-   **Vision:** To empower small business owners with a tool that is not only easy to use for daily operations but also provides powerful, AI-driven insights to help them grow their business.
-   **Target Audience:**
    -   **Owners:** Business owners who need to manage inventory, track performance, and make strategic decisions.
    -   **Workers:** Employees who need a fast and reliable interface to record sales and expenses.

---

## 2. Technology & Architecture

The application is built on a modern, robust technology stack chosen for performance, scalability, and developer experience.

-   **Framework:** React 18+ with Hooks
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS with a custom CSS variable-based theming system.
-   **Routing:** `react-router-dom` for client-side navigation.
-   **Charts & Visualization:** `recharts` for dynamic and responsive charts.
-   **AI Integration:** `@google/genai` SDK for interacting with the Gemini API.

### Core Architecture

-   **Component-Based:** The UI is built with a modular, component-based structure. Reusable components (e.g., `KPICard`, `ChartContainer`) are decoupled from page-level components.
-   **State Management:** State is primarily managed locally within components using React Hooks (`useState`, `useEffect`, `useContext`). The `useAuth` and `useTheme` hooks provide global state for authentication and theming via the Context API.
-   **Authentication:** A mock authentication system (`hooks/useAuth.tsx`) provides role-based access control, distinguishing between `owner` and `worker` roles.

---

## 3. Design Philosophy & UI/UX

The user interface is designed to be intuitive, visually appealing, and engaging.

### Core Principles

-   **Modern & Clean:** The UI prioritizes clarity with a minimalist aesthetic, reducing clutter.
-   **Glassmorphism:** The primary visual style uses blurred, semi-transparent backgrounds (`backdrop-blur`) and soft shadows to create a sense of depth and hierarchy.
-   **Data-First:** The design emphasizes clear data presentation through prominent KPI cards and intuitive charts.

### Theming System

-   **Technology:** A powerful and flexible theming system is built using CSS variables defined in `index.html`.
-   **Functionality:** Themes can be switched instantly across the entire application without a page reload. The `useTheme` hook manages the state.
-   **Animated Background:** A signature visual is the `animate-gradient-x` background, a large, 4-stop linear gradient that slowly animates its position, creating a subtle, premium ambiance.

### Layout & Responsiveness

-   **Desktop:** A fixed sidebar on the left provides primary navigation, while the main content area occupies the remaining space.
-   **Mobile:** The sidebar is hidden in favor of a slide-out menu, and the layout adapts to a single-column view for optimal use of vertical space.

### Animations & Micro-interactions

-   **`animate-bounce-in`:** A gentle bounce effect for loading elements like page headers and cards.
-   **`animate-slide-in-bottom`:** A smooth slide-up animation for modals and overlays.
-   **`hover-shimmer`:** A custom CSS animation that moves a subtle gradient shine across cards on hover, enhancing the premium feel.

---

## 4. Core Features & Functionality

The application is divided into several key pages and features, tailored to different user roles.

-   **Authentication (`LoginPage`):** A secure login page with mock user roles for "owner" and "worker".
-   **Owner Dashboard (`Ownersdashboard`):** An at-a-glance view of Key Performance Indicators (KPIs) like Total Revenue, Net Profit, and Transactions, along with charts for sales trends and top products.
-   **Record Sale (`SalesPage`):** A highly interactive page for workers to record sales. Features include a tappable product grid, a real-time cart, a custom number pad for payments, and AI-powered voice input for hands-free operation.
-   **AI Assistant (`AIAssistantPage`):** A conversational chat interface powered by Gemini. The AI has context on the business's sales, expense, and product data, allowing it to answer complex questions and provide tailored advice.
-   **Analysis (`AnalysisPage`):** A dedicated section for deep-diving into business data.
    -   **AI Predictions:** Provides a 7-day sales forecast and strategic insights (Opportunities, Risks).
    -   **Worker Comparison:** Allows owners to compare the performance of different workers side-by-side.
-   **Product & Stock Management (`ProductsPage`, `StockManagementPage`):** Tools for owners to add/view products and manage inventory levels from supplier to branch.
-   **Expenses, Transactions, & Notes:** Pages for recording expenses, viewing a detailed history of all transactions, and logging internal memos or reminders.

---

## 5. Data Management

The application is designed to work with both mock data for development and real data for production.

### Mock Data

-   **Source:** The file at `data/mockData.ts` contains all sample data for products, sales, expenses, etc.
-   **Purpose:** This allows for rapid UI development, offline work, and testing features with a predictable dataset without affecting live data.

### Real Data Integration

-   **Strategy:** The recommended approach is to replace mock data imports with asynchronous calls to a persistent backend like **Firebase Firestore**.
-   **Process:**
    1.  **Set up a backend** (e.g., Firebase) and populate it with real data.
    2.  **Create data fetching services** (e.g., `services/firestoreService.ts`) to get data from the backend.
    3.  **Update components** to use `useEffect` to call these fetching services, store the data in state, and handle loading/error states gracefully.
-   **Recommendation:** Keep the `mockData.ts` file during development as a valuable tool for testing and as a reference for the expected data structure.

---

## 6. AI Integration (`@google/genai`)

The Gemini API is a core part of the application's value proposition, providing intelligent features through `services/geminiService.ts`.

-   **Model:** The app primarily uses the `gemini-2.5-flash` model, which is optimized for speed and complex reasoning.
-   **Key AI Functions:**
    -   `getAIAssistantResponse`: Powers the conversational AI Assistant, sending chat history and business data as context for relevant answers.
    -   `getSalesForecast`: Generates a 7-day sales forecast by analyzing historical sales data.
    -   `getBusinessInsights`: Provides high-level strategic advice by summarizing sales and expense data.
    -   `parseSaleFromVoice`: Converts natural language from a user's voice into a structured JSON object for a sale, enabling hands-free operation.
-   **Implementation:** The service uses specific prompts and **JSON Schemas** with the Gemini API to ensure the AI returns structured, predictable data that the application can easily parse and display.