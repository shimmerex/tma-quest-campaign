# Implementation Roadmap

Create a Telegram Mini App clicker based on product.md, tech-stack.md, and workflow.md. The original scope (UI/Layout, State Management, Animations & Haptics, TON Connect Integration) is expanded below into the full phase list needed to cover product.md's complete feature set.

## Phase 0 — Scaffolding

Vite + React + TypeScript project; Tailwind configured with the Telegram CSS-variable mapping; ESLint/Prettier; folder structure per workflow.md §8.

## Phase 1 — UI/Layout (shell)

App shell: header, bottom tab bar, four empty screens (`Tap`, `Boosts`, `Quests`, `Friends`) swapped by local state. Telegram fallback wrapper (`lib/telegram.ts`) wired in at the root so every later phase can assume it exists.

## Phase 2 — State Management

Zustand stores — user/economy, upgrades, quests, settings — each with `persist`, a versioned schema, and debounced writes (workflow.md §4).

## Phase 3 — Tap Mechanic, Animations & Haptics

Large central coin. On tap: balance increases by current tap power, `HapticFeedback.impactOccurred('light')` fires, a "+N" flies from the exact tap coordinates and is removed from the DOM after the animation completes (workflow.md §2).

## Phase 4 — Energy System

Max energy pool, passive regen ticker, out-of-energy visual state, "Full Energy" boost consumption.

## Phase 5 — Boosts & Upgrades Screen

Tap Power / Energy Limit / Recharge Speed / Auto-Bot cards, cost formula sourced from `config/economy.ts`, purchase flow with balance check and success/error haptics.

## Phase 6 — Passive Income

Profit-per-hour accrual while the app is closed; "Welcome back, +N" offline-earnings claim modal on load.

## Phase 7 — Leagues & Progression UI

League badge and progress bar on the Tap screen header; league list sourced from `config/leagues.ts`.

## Phase 8 — Quests Screen

Full quest list rendered from `config/quests.ts`, covering all three quest types (`instant` / `external` / `daily`) with the complete status-machine UI (workflow.md §6). Includes the required "Connect Wallet" task, whose button triggers the TON Connect modal.

## Phase 9 — Daily Reward

Streak calendar component and claim logic, surfaced inside the Quests screen.

## Phase 10 — Friends: Referral + Leaderboard

Invite deep-link generation and a mocked "My Friends" list; mocked leaderboard with the current user's row always visible and highlighted.

## Phase 11 — Profile

Profile sheet opened from the header avatar: Telegram user info, league, short wallet address with disconnect action, basic stats.

## Phase 12 — TON Connect Integration

`TonConnectUIProvider` + manifest; connect button in the header and inside the wallet quest; successful connection auto-completes that quest; disconnect flow included.

## Phase 13 — Onboarding

First-launch welcome flow ending in a claimable starter bonus, gated by a `hasOnboarded` flag in the settings store.

## Phase 14 — Polish & QA Pass

Check every screen against workflow.md §9's Definition of Done: light/dark Telegram theme parity, browser-fallback (`npm run dev`) has no crashes or blank states, flying-number cap and store-selector usage verified for performance.
