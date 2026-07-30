# Tech Stack & Libraries

- **Framework:** React 18 + Vite (TypeScript).
- **Styling:** TailwindCSS v3.
- **State Management:** Zustand (using `persist` middleware to save state in `localStorage` / Telegram CloudStorage).
- **Telegram SDK:** `@telegram-apps/sdk` (or current TWA analog). Mandatory use of `tg.HapticFeedback`.
- **Web3:** `@tonconnect/ui-react` for wallet authorization.
- **Animations:** CSS-only animations (`transform`, `opacity`). FORBIDDEN to use heavy JS libraries like Framer Motion for tap particles to ensure maximum performance on low-end Android devices.
