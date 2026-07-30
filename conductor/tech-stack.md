# Tech Stack & Libraries

- **Framework:** React 18 + Vite (TypeScript, strict mode).
- **Styling:** TailwindCSS v3.
- **State Management:** Zustand, split into one store per concern rather than a single "god store":
  - `useUserStore` — balance, energy, taps, league
  - `useUpgradesStore` — boost levels & derived costs
  - `useQuestsStore` — quest status, streak
  - `useSettingsStore` — haptics/sound toggles, onboarding flag
    All wrapped with the `persist` middleware and a versioned schema (see workflow.md §4).
- **Persistence layer:** A custom `persist` storage adapter — writes to `localStorage` by default, and mirrors to Telegram `CloudStorage` when running inside Telegram. Writes are debounced (see workflow.md §4) since CloudStorage has stricter rate limits than localStorage.
- **Telegram SDK:** `@telegram-apps/sdk` (or `@twa-dev/sdk` as fallback) for `WebApp.ready()`, `WebApp.expand()`, `HapticFeedback`, `initDataUnsafe.user`, theme params, and `BackButton` where relevant. All calls are wrapped by a single `lib/telegram.ts` module — nothing else imports the SDK directly.
- **Web3:** `@tonconnect/ui-react` for wallet authorization. `tonconnect-manifest.json` is served from `/public` and must be reachable over HTTPS at the deployed origin.
- **Icons:** `lucide-react` — lightweight and tree-shakeable, reads as a real product rather than a marketing site.
- **Animations:** CSS-only animations (`transform`, `opacity`, `@keyframes`). **Forbidden** to use heavy JS animation libraries like Framer Motion for tap particles, to guarantee performance on low-end Android devices inside Telegram's in-app WebView. `requestAnimationFrame` is acceptable for things that must be JS-driven (e.g. the energy regen ticker), but never for per-tap particle animation.
- **Mock backend layer:** `src/services/` — plain async functions (`getLeaderboard()`, `verifyQuest()`, `claimDailyReward()`) that `await delay(ms)` before resolving, so loading and error states are real and demoable, and so a genuine API can later replace the internals without touching components.
- **Number formatting:** a small `formatNumber` utility for K/M/B/T suffixes. All economy math is done in integers (smallest unit), never floats, to avoid rounding drift in the balance.
- **Navigation:** no router library. The four screens are swapped via local/global UI state inside a bottom tab bar. A TMA is a single logical screen from Telegram's point of view — introducing `react-router` would add deep-linking/browser-history complexity with no real benefit here, and would need extra work to stay in sync with Telegram's `BackButton`.
- **Linting/formatting:** ESLint (`typescript-eslint`) + Prettier, pre-configured. No test framework is included — this is a deliberate scope call for a demo build, not an oversight, and should be stated as such if asked.
- **Build target:** relative asset paths only (`base: './'` in Vite config where applicable), so the build works when hosted on any static host behind Telegram's in-app WebView.
