# COGNIGUIDE — React Native (Expo SDK 54)

Installable caregiver app for Android / iOS with **real phone notifications**.

Targets **Expo SDK 54** (React Native **0.81** / React **19.1**) so it runs in **Expo Go** builds that support SDK 54.

The app loads the live COGNIGUIDE dashboard inside a native WebView and listens for alert messages (dual-verified fall / wandering). When both the smartwatch and home ESP32 nodes agree, **Expo Notifications** shows a system notification on your phone.

## Requirements

- Node.js **20.19+**
- Phone with **Expo Go** that supports **SDK 54**  
  (If Expo Go on your store only supports a newer SDK, use an APK build below instead.)

## Quick start (phone on same Wi‑Fi)

```bash
cd mobile
npm install
npx expo start
```

1. Install **Expo Go** (SDK 54–compatible) from the Play Store / App Store  
2. Scan the QR code with Expo Go (Android) or the Camera app (iPhone)  
3. Allow notifications when prompted  

You’ll get a “COGNIGUIDE ready” toast. Caregiver alerts fire only after **dual verification** (watch + home nodes).

> Dashboard URL: `https://lovenialaw.github.io/cogniguide/#/`  
> Override for local LAN testing by changing `DASHBOARD_URL` in `App.tsx`.

## Build a real APK (no Expo Go needed)

```bash
npm install -g eas-cli
cd mobile
eas login
eas build -p android --profile preview
```

EAS returns a download link for an `.apk` you can install on Android.

```bash
eas build -p ios --profile preview
```

## Project structure

```
mobile/
  App.tsx          # WebView shell + notification handler (SDK 54)
  app.json         # Bundle IDs, notification plugin, permissions
  eas.json         # APK build profiles
  package.json     # expo ~54.0.0
```

Web dashboard bridge (parent project):

```
src/lib/nativeBridge.ts
src/components/AlertNotificationBridge.tsx
```

## Notes

- This is an **Expo SDK 54** shell around the React web dashboard (fastest path to phone install + notifications).
- Dual-verified emergencies only: the WebView posts `cogniguide_alert` after watch + ESP32 consensus.
- Server push (FCM/APNs) can be added later; local notifications work once the alert is generated in-app.
