# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary users:** University and college students (especially engineering, design, and builder communities—such as `iiitnr.edu.in` student builders) seeking peers with complementary or shared skills for side projects, hackathons, study groups, and skill-swapping.
- **Usage context:** Used across desktop browsers (`/`) for broader discovery and team-channel collaboration, and on mobile web / the `SkillMateAndroid` WebView wrapper (`/app`) for quick check-ins, swipe-deck peer discovery, and real-time messaging.

## Product Purpose

SkillMate helps students turn shared and complementary skills into working collaborations. Instead of cold networking or noisy social feeds, students create a skill-and-interest profile, find peers with high overlap or complementary "Skill Swaps," send intent-driven icebreaker connection requests, join topic circles, and coordinate in 1-on-1 direct messages or topic team channels.

Success means a student quickly finds a compatible collaborator (e.g., a developer finding a UI/UX designer or vice versa), initiates a meaningful conversation, and stays active in focused skill circles and team workspaces.

## Positioning

SkillMate's primary mechanism is **complementary skill-swap matching and project teammate discovery**, supported by topic circles and real-time team channels:

- **Discover (Feed & Swipe Deck):** Ranks members by skill match score, highlights **Perfect Swaps** (complementary skills between the user and a peer), filters by vibe (`Top Matches`, `Online Now`, `Nearby`, `Tech`, `Design`, `Music`), city, and skills, and uses quick icebreaker intent chips (`Let's collab on a project`, `Want to learn from you!`, `Let's swap skills`, `Just connecting`) to start connections.
- **Network & Matching:** Visualizes an interactive skill/interest lattice, calculates live match potential across 18 core topics, lists accepted connections, and hosts **Team Channels** for public/private group workspaces.
- **Communities & Circles:** Provides 18 curated topic circles (e.g., *Neural Nexus* for AI, *PyVerse* for Python, *Stack Society* for Web Development, *Launchpad League* for Startups, *Pixel Society* for Design) with joined vs. explore tabs and live circle chat.
- **Real-Time Messenger (`GlassChat`):** Full-screen unified messaging drawer for 1-on-1 DMs and channel rooms with Socket.IO live updates, typing indicators, reactions, polls, pinned messages, file/image attachments, and WebRTC call signaling.

## Operating Context

- **Dual frontend surfaces, single backend:** Express 5 (`project/server.js`) serves the responsive web app at `/` (`public/web/`) and the mobile-first WebView shell at `/app` (`public/app/`), plus `/api/*` and `/api/chat/*` REST routes and Socket.IO WebSockets.
- **Native wrapper:** `SkillMateAndroid` hosts `/app` inside an Android WebView with native OTA version checking (`/api/app/version`) and APK updates (`app-version.json` currently at `3.6.0`).
- **Persistence & demo readiness:** Backed by Supabase PostgreSQL (`db.js`, `chat-db.js`) with `connect-pg-simple` sessions, seeded with 18 topic circles (`COMMUNITY_CATALOG`), demo team accounts (`TEAM_DEMO_ACCOUNTS`), and 25 local fallback `DEMO_PROFILES` in `script.js` so discovery remains functional even before full account onboarding.

## Capabilities and Constraints

- **Vanilla frontend stack:** Plain HTML, CSS, and modular vanilla JavaScript (`script.js`, `discover.js`, `glass-chat-client.js`, `intro-splash.js`) with no bundler, CSS preprocessor, or frontend framework.
- **Non-breaking DOM & API contract:** Existing element IDs, `data-*` attributes, inline `onclick` handlers, global `window.GlassChat` / `window.getDiscoverBridgeState` bridges, REST endpoints (`/api/auth/*`, `/api/profile`, `/api/discover`, `/api/connections/*`, `/api/communities/*`, `/api/chat/*`), and Socket.IO event names must remain intact across all UI work.
- **Security & CSP:** Served with `helmet` Content Security Policy (`defaultSrc: 'self'`, `scriptSrc: 'self' 'unsafe-inline'`, `styleSrc: 'self' 'unsafe-inline'`, `imgSrc: 'self' data: blob:`, `connectSrc: 'self' ws: wss:`, `fontSrc: 'self'`). Note that `index.html` links Google Fonts (`Playfair Display`, `Plus Jakarta Sans`) while `fontSrc` is currently restricted to `'self'`—future font changes must account for Helmet's `fontSrc` directive or self-hosted font files.
- **Media & upload limits:** Profile photos accept JPG/PNG/WEBP/GIF up to 5 MB; chat attachments accept up to 50 MB via `multer` into `/uploads`.

## Brand Commitments

- **Name:** `SkillMate.` (rendered with a muted sage accent on the trailing period).
- **Taglines in codebase:** *"Find your people"*, *"Connect. Build. Level up."*, and *"Built for curious minds."*
- **UI direction (user-confirmed):** Keep the interface **clean, modern, and minimal**—prioritizing clarity, calm matte surfaces, and restrained visual hierarchy over decorative clutter.

## Evidence on Hand

- **Web & mobile shells:** `project/public/web/` (`index.html`, `style.css`, `script.js`, `discover.js`, `glass-chat-client.js`, `intro-splash.js`) and `project/public/app/` (`index.html`, `app.css`, `script.js`, `discover.js`, `glass-chat-client.js`, `intro-splash.js`).
- **Backend & real-time layer:** `project/server.js`, `project/db.js`, `project/chat-db.js`, `project/chat-routes.js`, `project/chat-sockets.js`.
- **Android wrapper:** `SkillMateAndroid/app/src/main/java/com/skillmate/app/MainActivity.kt` (WebView + OTA updater) and `project/app-version.json`.
- **Absences (do not fabricate):** No verified external user testimonials, press quotes, growth metrics, or custom brand photography exist in the repository beyond `intro.mp4`, `favicon.png`, and seeded demo profiles (`DEMO_PROFILES`).

## Product Principles

1. **Complementary matching first:** Surface skill overlap, complementary swap potential, and actionable icebreakers before generic social metadata.
2. **Low-friction onboarding and exploration:** Let students browse skills and circles immediately while guiding profile completion (role, city, interests) naturally.
3. **Calm, minimal craft over noise:** Keep discovery, communities, and chat focused on people and skills—never bury core actions behind decorative chrome.
4. **Parity across `/` and `/app`:** Visual and UX improvements must keep both desktop web and mobile WebView shells coherent, responsive, and safe-area aware.
5. **Preserve behavior as a hard invariant:** Styling and layout refinements must never alter JS state hooks, form submissions, Socket.IO room subscriptions, or API payloads.
