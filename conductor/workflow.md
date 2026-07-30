# Development Workflow & Rules

## 1. UI and Telegram Theming

- Strictly use native Telegram CSS variables for colors (e.g., `var(--tg-theme-bg-color)`, `var(--tg-theme-text-color)`, `var(--tg-theme-button-color)`).
- No hardcoded colors that would break the user's dark/light theme.
- Strict Mobile-First design (maximum container width 480px, `overflow-x: hidden`).
- Call `tg.ready()` and `tg.expand()` on mount. Use `tg.viewportStableHeight` for the app's height instead of `100vh` — Telegram's WebView resizes the viewport when the on-screen keyboard opens, and `100vh` does not track that.
- Disable vertical swipe-to-close (`tg.disableVerticalSwipes()`, where supported) so an accidental swipe during rapid tapping doesn't dismiss the app.
- The bottom tab bar must respect `env(safe-area-inset-bottom)` for devices with a home indicator.

## 2. Animation Optimization (CRITICAL)

- Tap particles (flying clicks) must be implemented by dynamically appending DOM elements with CSS classes utilizing `@keyframes` (`transform: translate(...)` and `opacity`).
- Animation elements MUST be removed from the DOM immediately after the animation completes (via `setTimeout` or `onAnimationEnd`) to prevent memory leaks.
- Cap the number of concurrent flying-number elements (e.g. 15). If the cap is hit, skip spawning a new one rather than letting the animation degrade — a slightly quieter screen beats visible jank.

## 3. Environment Handling (Fallbacks)

- The code must check if the app is running inside Telegram. If running in a standard web browser (local development), HapticFeedback and TG variables must have safe fallbacks so the app does not crash during `npm run dev`.
- All Telegram SDK access goes through a single `src/lib/telegram.ts` module — every consumer imports from there, never from the SDK directly, so every fallback lives in one place.
- Outside Telegram, mock `initDataUnsafe.user` with a plausible fake user (e.g. name "Demo User", a generated id) so the Profile and Leaderboard screens never show a blank or broken state while running `npm run dev`.

## 4. State & Persistence Rules

- Each Zustand store owns exactly one concern (user/economy, upgrades, quests, settings) — no single store holding unrelated state.
- Persisted writes are debounced (~500ms). In-memory balance can update on every single tap, but the store only flushes to storage on that debounce tick or on `visibilitychange`/unmount, to avoid hammering `CloudStorage`'s rate limits.
- On load, compute offline passive income earned since `lastSeenAt`, capped at the configured max offline duration, and present it as a "Welcome back, +N" claim — never credit it silently.
- Any change to a store's persisted shape must bump a `version` field read by the `persist` migrate function. Never assume an old `localStorage` payload matches the current code's shape.

## 5. Economy Balancing Rules

- All costs and rewards are defined as data in `src/config/economy.ts`, `quests.ts`, and `leagues.ts` — never hardcoded inline inside components, so the numbers can be tuned without touching component code.
- Upgrade costs follow a documented scaling formula (e.g. `cost = baseCost * growth^level`) rather than ad hoc per-level numbers.
- League thresholds are an ordered array checked top-down; adding a league is a one-line data change, not a code change.

## 6. Quest System Rules

- Quest definitions are data-driven (`src/config/quests.ts`): `{ id, type, title, reward, action }`.
- Three supported `type`s: `instant` (claims immediately, e.g. the wallet-connect trigger), `external` (opens a link, then shows a "Check" button after a short cooldown to simulate verification), `daily` (tied to the streak system, one claim per UTC day).
- A quest's status machine is always `locked → available → pending → claimed`. The UI must render a distinct state and CTA label for each step — it must never jump straight to "claimed" without showing the intermediate states.

## 7. Performance Rules

- Components must select narrowly from a store (`useUserStore(s => s.balance)`), never destructure the whole store, to avoid re-rendering the entire tree on every tap.
- The coin's press/scale feedback and the flying-number spawn must not go through React state. Do both via direct DOM manipulation (ref + class toggle) inside the tap handler, so a tap never triggers a React re-render on its own.

## 8. File & Component Structure

```
src/
  components/   # presentational, reusable
  screens/      # one per tab: TapScreen, BoostsScreen, QuestsScreen, FriendsScreen
  store/        # zustand stores, one file per slice
  services/     # mocked async "API" layer
  config/       # economy.ts, quests.ts, leagues.ts — tunable data
  lib/          # telegram.ts, tonconnect.ts, haptics.ts, format.ts
  hooks/
```

## 9. Definition of Done (per feature)

- Works with zero crashes both inside Telegram and in a plain browser tab (`npm run dev`).
- No hardcoded colors outside theme variables; verified against both a light and a dark Telegram theme.
- Any async action (quest verify, leaderboard fetch, daily claim) shows a loading state and an error state — not just the happy path.
