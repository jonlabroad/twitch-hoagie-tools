# Twitch Multichat Integrator

Basic Chrome extension skeleton with TypeScript, Manifest V3, DOM monitoring, and tab communication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run dev
```

## Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the project folder
5. Navigate to `twitch.tv` to test

## Structure

- `src/background.ts` - Background service worker (handles cross-tab communication)
- `src/content.ts` - Content script (monitors Twitch DOM for chat messages)
- `manifest.json` - Extension manifest
- `dist/` - Compiled JavaScript output

## How it works

- Content script monitors Twitch chat for new messages
- When detected, sends message to background worker
- Background worker broadcasts to all other Twitch tabs
- Other tabs receive the broadcast and can react
