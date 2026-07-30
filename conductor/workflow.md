# Development Workflow & Rules

## 1. UI and Telegram Theming

- Strictly use native Telegram CSS variables for colors (e.g., `var(--tg-theme-bg-color)`, `var(--tg-theme-text-color)`, `var(--tg-theme-button-color)`).
- No hardcoded colors that would break the user's dark/light theme.
- Strict Mobile-First design (maximum container width 480px, `overflow-x: hidden`).

## 2. Animation Optimization (CRITICAL)

- Tap particles (flying clicks) must be implemented by dynamically appending DOM elements with CSS classes utilizing `@keyframes` (`transform: translate(...)` and `opacity`).
- Animation elements MUST be removed from the DOM immediately after the animation completes (via `setTimeout` or `onAnimationEnd`) to prevent memory leaks.

## 3. Environment Handling (Fallbacks)

- The code must check if the app is running inside Telegram. If running in a standard web browser (local development), HapticFeedback and TG variables must have safe fallbacks so the app does not crash during `npm run dev`.
