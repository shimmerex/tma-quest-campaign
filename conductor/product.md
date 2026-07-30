# Product Definition: Shimmer TMA Lab (Telegram Mini App)

## Core Concept
We are building a Telegram Mini App (TMA). This is a Single Page Application (SPA) loaded inside a Telegram WebApp iframe. The product must feel like a native Telegram feature, not a regular website.

## Target Audience
Crypto enthusiasts, Web3 users, and Telegram communities. The user expects instant load times, seamless wallet connection, and native mobile interactions.

## Key Design Principles
1. **Illusion of Native:** The app must seamlessly blend with the user's Telegram theme (Dark/Light).
2. **Mobile-First Absolute:** The app will strictly be used on mobile devices. Desktop layout is irrelevant and should not be considered. Maximum container width is 480px.
3. **Frictionless Web3:** Wallet connection (TON Connect) and transactions must be intuitive, with clear loading states and error handling.
4. **Haptic Feedback:** Every significant user interaction (button click, success, error) must trigger Telegram's native haptic feedback.
