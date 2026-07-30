# Development Workflow & Coding Rules

## 1. UI & Styling Rules (CRITICAL)
- **Telegram Native Variables:** You MUST use Telegram's CSS variables for ALL colors to ensure automatic Dark/Light mode support.
  - *Backgrounds:* `var(--tg-theme-bg-color)`, `var(--tg-theme-secondary-bg-color)`
  - *Text:* `var(--tg-theme-text-color)`, `var(--tg-theme-hint-color)`
  - *Buttons:* `var(--tg-theme-button-color)`, `var(--tg-theme-button-text-color)`
  - *Links:* `var(--tg-theme-link-color)`
- NEVER use Tailwind color classes (e.g., `bg-white`, `text-black`, `bg-blue-500`) for structural elements unless explicitly building a custom branded component that ignores the user's Telegram theme.
- **Layout:** Everything must fit within a mobile viewport (`max-w-md mx-auto min-h-screen`). Prevent horizontal scrolling (`overflow-x-hidden`).

## 2. Telegram SDK Integration
- Always call `WebApp.ready()` at the root of the application (usually in `App.tsx`) to notify Telegram that the app has loaded.
- Always implement `WebApp.expand()` if the app requires full-screen height.
- Wrap all clickable UI elements (buttons, list items) with haptic feedback: `WebApp.HapticFeedback.impactOccurred('light' | 'medium' | 'heavy')`.

## 3. Web3 & Smart Contracts (TON)
- Wallet connection must be handled by `<TonConnectUIProvider>`.
- Always wrap transaction calls in `try...catch` blocks.
- Always provide explicit visual feedback (loading spinners, disabled buttons) while a transaction `isPending`.
- Extract all contract interaction logic into custom hooks (e.g., `useTonContract.ts`) inside `src/hooks/`. Keep UI components clean.

## 4. Code Quality
- Strictly use TypeScript interfaces for all component props, state objects, and API responses.
- Extract reusable UI parts (Buttons, Cards, Modals) into `src/components/ui/`.
- Clean up console logs before finalizing a task.
