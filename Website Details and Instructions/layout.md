
# Sari POS - Visual & Layout Design Brief

This document outlines the core design philosophy, visual identity, and layout principles for the Sari POS application. It serves as a guide for all frontend development to ensure a cohesive, modern, and user-friendly experience.

## 1. Core Design Philosophy

-   **Modern & Clean:** The UI prioritizes clarity and ease of use with a minimalist aesthetic.
-   **Glassmorphism:** The primary visual style relies on a "glass" effect, using blurred backgrounds, subtle transparency, and soft shadows to create a sense of depth and hierarchy.
-   **Data-First:** The design emphasizes clear, scannable data presentation through prominent KPI cards and intuitive charts.
-   **Responsive & Adaptive:** The layout is fully responsive, providing an optimal experience on any device, from a small mobile phone to a large desktop monitor.
-   **Engaging & Dynamic:** The interface is brought to life with a dynamic theming system, fluid animations, and satisfying micro-interactions.

## 2. Theming System

The theming system is a cornerstone of the application's identity, allowing for user personalization and brand alignment.

-   **Technology:** It's built entirely on CSS variables, defined in `index.html`. This allows for instant, app-wide theme changes without a page reload.
-   **Structure:**
    -   A set of global CSS variables defines the color palette (e.g., `--primary`, `--secondary`, `--card-bg`, `--text-primary`).
    -   Theme-specific classes (e.g., `.theme-ocean`, `.theme-forest`) override these variables.
    -   A script in `App.tsx` toggles the appropriate theme class on the `<body>` element.
-   **Animated Background:**
    -   A signature visual feature is the `animate-gradient-x` background.
    -   It's a large, 4-stop linear gradient using the theme's `--background-start-rgb` and `--background-end-rgb` variables.
    -   The `background-position` is animated slowly over 15 seconds, creating a subtle, dynamic ambiance that feels premium and alive.

## 3. Layout and Responsiveness

A single, adaptive layout structure ensures consistency across all screen sizes.

-   **Desktop View (≥ `lg` breakpoint):**
    -   **Fixed Sidebar:** A 256px-wide sidebar is fixed to the left, providing primary navigation. It has a glass effect (`bg-black/20 backdrop-blur-sm`) to maintain the design language.
    -   **Main Content:** The main content area occupies the remaining screen space, with left padding (`lg:pl-64`) to prevent overlap.

-   **Mobile View (< `lg` breakpoint):**
    -   **Hidden Sidebar:** The desktop sidebar is hidden.
    -   **Bottom Navigation:** A fixed bottom navigation bar appears, providing access to the most critical pages. It also features a glass effect (`bg-black/30 backdrop-blur-lg`) and respects the iOS safe area (`pb-[env(safe-area-inset-bottom)]`).

## 4. Component Visual Design

Individual components are meticulously styled to be consistent with the overall aesthetic.

#### a. Cards (`KPI_Card`, `ChartContainer`, etc.)

Cards are the primary building blocks for displaying content.

-   **Style:** Glassmorphism is key.
    -   `background-color`: A semi-transparent color from the theme (`--card-bg`).
    -   `backdrop-filter`: `blur-md` to create the frosted glass effect.
    -   `border`: A subtle, semi-transparent border (`--border`) to define the card's edges.
    -   `border-radius`: Generously rounded corners (`rounded-2xl`).
    -   `box-shadow`: Soft shadows (`shadow-lg`) to create depth.
-   **Hover Interaction:**
    -   **`hover:scale-105`**: The card slightly enlarges to provide clear feedback.
    -   **`hover-shimmer` effect**: A custom CSS animation (`@keyframes shimmer`) moves a subtle gradient shine across the card on hover. This is a "delightful detail" that enhances the premium feel of the UI.

#### b. Buttons & Controls

-   **Primary Buttons:** Use the theme's `--primary` color for high-visibility actions (e.g., "Save Sale", "Login").
-   **Secondary Buttons:** Use a muted, semi-transparent style (`bg-white/10`) that complements the glass aesthetic without competing for attention.
-   **Active State:** Selected navigation links and filters are highlighted with the primary theme color to provide unambiguous feedback on the user's current context.
-   **Transitions:** All interactive elements have smooth `transition-all` properties for polished feedback on hover and click.

## 5. Animations & Micro-interactions

Animations are used purposefully to guide the user and improve the perceived performance.

-   **`animate-bounce-in`:** A gentle "bounce" effect used for initial content loading (page headers, cards). It makes the UI feel responsive and lively.
-   **`animate-slide-in-bottom`:** A smooth slide-up animation used for modals and overlays (like the Sales Page number pad). It clearly communicates the appearance of a new UI layer.
-   **Spinners:** The loading spinner's color is tied to the theme's `--primary` variable, ensuring visual consistency even during loading states.
