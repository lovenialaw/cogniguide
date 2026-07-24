# COGNIGUIDE — React Native (Expo SDK 54)

Caregiver app with phone notifications. Loads the live dashboard in a WebView.

**SDK:** Expo 54 · React Native 0.81 · React 19.1

## Quick start (recommended — avoids LAN / AppDelegate errors)

```bash
cd mobile
npm install
npm start
```

`npm start` uses **Expo Tunnel** so your phone does **not** need to be on the same Wi‑Fi as the PC. This avoids:

> “Node server is running… AppDelegate… same network…”

1. Install **Expo Go** (SDK 54)  
2. Scan the QR code in the terminal  
3. Allow notifications  

### LAN-only (same Wi‑Fi)

```bash
npm run start:lan
```

Then open Expo Go → Enter URL: `exp://YOUR_PC_IP:8082`

## Dashboard URL

Default: `https://lovenialaw.github.io/cogniguide/#/`  
Change `DASHBOARD_URL` in `App.tsx` for local testing.

## Notifications

| Event | Example |
|-------|---------|
| Dual-verified fall | `Eleanor Whitfield fell in Living Room` |
| Dual-verified wandering | `Eleanor Whitfield wandered at Kitchen` |

## APK build (no Expo Go)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
