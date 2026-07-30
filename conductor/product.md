# Product Definition: Quest & Airdrop Platform (Clicker TMA)

## Product Essence

A reference Telegram Mini App (TMA) showcasing a full "Tap-to-Earn" loop (in the vein of Hamster Kombat / Notcoin) plus a Quests system for future airdrops. The app is a portfolio piece for client demonstrations — it must feel like a complete, shippable product on a single demo pass, not a proof-of-concept with dead ends or empty states.

## Target Use Case

Shown live to prospective clients as evidence of TMA delivery capability: Telegram theming, TON Connect, Zustand-driven state, and a genre-accurate economy loop, all running smoothly on low-end Android devices.

## Core Loop

Tap to earn → spend energy → energy regenerates over time (or instantly via a boost) → earn passive income while the app is closed → spend soft currency on upgrades → climb leagues → complete quests for bonus rewards → invite friends for a referral bonus → check leaderboard rank.

## Information Architecture

Bottom tab bar (4 tabs) + header:

- **Tap** (home) — main coin, balance, energy bar, league badge
- **Boosts** — upgrade shop (tap power, energy limit, recharge speed, auto-bot)
- **Quests** — task list + daily reward calendar
- **Friends** — leaderboard + referral program
- **Header** — avatar (opens Profile), TON wallet connect pill, settings icon

## Key Features

### 1. Tap Mechanic

Main screen with a large interactive coin/button. Tapping increases the point balance by the current tap power, consumes 1 energy, and gives immediate visual + haptic feedback.

### 2. Energy System

- A max energy pool; every tap consumes 1 energy (configurable).
- Energy regenerates passively (1 point per N seconds), capped at the max.
- A "Full Energy" boost item refills the pool instantly, limited uses per day.
- At 0 energy the coin is still tappable but grants no reward, with a distinct "out of energy" visual (dimmed coin, subtle shake) rather than a disabled/dead button.

### 3. Visual & Haptic Feedback

- Mandatory `HapticFeedback.impactOccurred('light')` on every successful tap.
- `notificationOccurred('success')` on quest claim / boost purchase, `('error')` on a failed action (e.g. insufficient balance).
- `selectionChanged` on tab/navigation switches.
- CSS animation of a "+N" flying from the exact tap coordinates on every tap.

### 4. Progression: Leagues

Balance-based leagues, each with an icon, name, and threshold, shown as a badge with a progress bar toward the next league. Illustrative example:

| League   | Threshold |
| -------- | --------- |
| Bronze   | 0         |
| Silver   | 5,000     |
| Gold     | 25,000    |
| Platinum | 100,000   |
| Diamond  | 500,000   |
| Legend   | 1,000,000 |

### 5. Boosts & Upgrades

Purchasable with in-app soft currency, each with a scaling cost per level:

- **Tap Power** — increases points earned per tap.
- **Energy Limit** — increases the max energy pool.
- **Recharge Speed** — reduces the energy regen interval.
- **Auto-Bot** — enables passive income accrual (see below).

### 6. Passive Income

Once the Auto-Bot boost is owned, the account accrues points per hour even while the app is closed. On return, an elapsed-time calculation (capped at a max offline duration, e.g. 3 hours) produces a "Welcome back, +N" claim rather than a silent credit.

### 7. Quests

A dedicated section listing tasks, grouped by category:

- **Wallet** — "Connect TON Wallet" (functional; the one required task for the base build).
- **Social** — "Subscribe to Channel", "Follow on X", etc.
- **Partner** — visit an external link, then a timed "Check" step simulates verification.
- **Daily** — tied to the login streak (see below).

Each quest has an icon, title, reward, and a status of `locked → available → pending → claimed`, with a distinct CTA label at every stage — never jumps straight to "claimed".

### 8. Daily Reward

A 7-day streak calendar with escalating rewards per day, claimable once per UTC day. Missing a day resets the streak (grace-period behavior, if wanted, is a deliberate product decision to be stated explicitly, not left implicit).

### 9. Referral Program

A unique invite deep-link (`t.me/<bot>?start=ref_<id>`). Both inviter and invitee receive a reward on signup. A simple "My Friends" list shows invited users with mocked stats, since there is no real backend.

### 10. Leaderboard

Global top-N ranking by balance, with the current user's row always visible and highlighted even if outside the visible top-N. Backed by a seeded mock dataset for the demo.

### 11. Profile

Opened from the header avatar: Telegram profile photo/name if available, current balance, league, short wallet address if connected (with a disconnect action), and basic stats (total taps, join date).

### 12. TON Connect

Wallet connect modal via TON Connect. A connected wallet auto-completes the "Connect TON Wallet" quest and updates the header pill and Profile screen. Includes a disconnect flow.

### 13. Onboarding

First-launch only: a short welcome moment (single modal or 2–3 step intro) ending in a claimable starter bonus, so a brand-new account never opens onto an empty, zero-balance screen.

### 14. State Persistence

Balance, energy, upgrade levels, quest status, streak, and settings all persist locally — `localStorage` as the web fallback, mirrored to Telegram `CloudStorage` when running inside Telegram — so a returning user never loses progress.

## Explicit Non-Goals (for a demo build)

- No real backend/database. All "server" calls (leaderboard, quest verification, daily claim) are mocked async functions with artificial latency, isolated behind a service layer so a real API can later replace them without touching UI code.
- No real token/airdrop distribution — rewards are in-app soft currency only.
- No production analytics or anti-cheat — out of scope for a portfolio piece.
