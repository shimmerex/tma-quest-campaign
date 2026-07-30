# Tech Stack & Libraries

## Core Infrastructure
- **Build Tool:** Vite (Fast, optimized for static SPA).
- **Framework:** React 18+ (TypeScript is MANDATORY).
- **Architecture:** Client-side rendering only. DO NOT use Next.js, SSR, or Server Components.

## Telegram & Web3
- **Telegram SDK:** `@twa-dev/sdk` (For reading user data, theming, and haptic feedback).
- **Web3/Blockchain:** `@tonconnect/ui-react` (For wallet connection and transaction payloads on the TON blockchain).

## State & Data
- **Local State:** `zustand` (Avoid Context API for complex state to prevent re-renders).
- **Data Fetching:** Native `fetch` or `@tanstack/react-query` if polling is required.

## Styling & UI
- **Engine:** Tailwind CSS.
- **Icons:** `lucide-react`.
- **Utility:** `clsx`, `tailwind-merge` (for dynamic class compilation).
- **UI Components:** Build custom "dumb" components using Tailwind. Do not install heavy UI libraries like MUI or Ant Design.

## Strictly Prohibited
- `ethers.js`, `wagmi`, `viem` (Unless specifically requested for an EVM project. Default is TON).
- `any` types in TypeScript.
- Hardcoded HEX colors for backgrounds or text (See workflow.md for styling rules).
