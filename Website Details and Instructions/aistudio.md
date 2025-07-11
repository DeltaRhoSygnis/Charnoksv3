
# Sari POS - Frontend Architecture & Design

This document outlines the frontend architecture, design principles, and key features of the Sari POS application.

## 1. Project Overview

Sari POS is a Progressive Web App (PWA) designed as a complete Point of Sale solution for small businesses. It features a clean, responsive interface, powerful data visualization, and AI-powered analytics to help business owners make informed decisions. The application is built with a focus on usability, performance, and modern aesthetics.

## 2. Technology Stack

-   **Framework:** React 19 with Hooks
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS with a custom CSS variable-based theming system.
-   **Routing:** `react-router-dom` for client-side navigation.
-   **Charts & Visualization:** `recharts` for dynamic and responsive charts.
-   **AI Integration:** `@google/genai` SDK for interacting with the Gemini API to provide sales forecasts and business insights.

## 3. Core Architecture

-   **Component-Based:** The application is built using a modular, component-based architecture. Reusable UI components (`KPICard`, `ChartContainer`, `Spinner`) are separated from page-level components.
-   **State Management:** State is managed primarily through React Hooks (`useState`, `useEffect`, `useCallback`, `useContext`). For cross-component state like the current theme, the Context API (`useTheme`) is used to provide a clean and efficient solution without external libraries.
-   **Theming System:** A robust theming system is implemented in `index.html` using CSS variables. This allows for instant theme switching across the entire application. The `useTheme` hook provides a simple API for components to interact with the theme state.
-   **Responsive Layout:** The application uses a responsive layout component (`ResponsiveLayout.tsx`) that adapts to different screen sizes. It features a full sidebar for desktop views and a compact bottom navigation bar for mobile devices, ensuring a great user experience on any device.

## 4. Key Features

### a. Branding & Identity

The application uses a clean and minimal design aesthetic. The brand "Sari POS" is used consistently to provide a clear identity without relying on graphical logos, ensuring the UI remains uncluttered and focused on functionality.

### b. Record Sale Page (`SalesPage.tsx`)

This is a core feature for store workers, designed for speed and ease of use.

-   **UI/UX:**
    -   A mobile-first, two-panel layout is used (product grid and cart/payment). On mobile, these panels stack vertically for optimal use of space.
    -   The interface adheres to the selected theme for a cohesive look.
    -   All interactive elements are large, touch-friendly, and provide clear visual feedback.

-   **Workflow:**
    1.  **Tap-to-Add:** Workers can quickly add products to a sale by tapping on them in the product grid.
    2.  **Interactive Cart:** The cart updates in real-time, showing items, quantities, and the total cost.
    3.  **Calculator Keypad:** A custom modal with a calculator-style keypad appears for numeric inputs (quantity and money received). This is far more efficient than a standard text input on mobile devices.
    4.  **Auto-Calculation:** The system automatically calculates the change due to the customer, reducing the chance of manual error.
    5.  **Save & Success:** A "Save Sale" button finalizes the transaction, which triggers a clear success animation and resets the interface for the next sale.

-   **State Management:** All state for the sales process (cart items, payment details, UI visibility) is managed locally within the `SalesPage` component using `useState`, keeping the logic encapsulated and easy to maintain.

### c. AI-Powered Analytics (`AnalysisPage.tsx`)

-   **Sales Forecasting:** Utilizes the Gemini API to generate a 7-day sales forecast based on historical data.
-   **Business Insights:** Sends summarized sales and expense data to the Gemini API to receive actionable insights, potential risks, and growth opportunities.
-   **Async Handling:** The page gracefully handles loading and error states while fetching data from the AI service, providing clear feedback to the user with spinners and error messages.

### d. Dashboard (`HomePage.tsx`)

-   Provides an at-a-glance overview of the business with key performance indicators (KPIs) and visual charts showing sales trends and top-performing products.
