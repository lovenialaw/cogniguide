# COGNIGUIDE — React Native (Expo) Mobile App

Installable caregiver app for Android / iOS with **real phone notifications**.

The app loads the live COGNIGUIDE dashboard inside a native WebView and listens for alert messages (fall, wandering, strong WiFi motion). When an alert fires, **Expo Notifications** shows a system notification on your phone.

## Quick start (phone on same Wi‑Fi)

1. Install **Expo Go** from the Play Store / App Store  
2. On your PC:

```bash
cd mobile
npm install
npx expo start
```

3. Scan the QR code with Expo Go (Android) or the Camera app (iPhone)

When the app opens, allow notifications. You’ll get a “COGNIGUIDE ready” toast, then real alerts when you tap **Simulate Fall** / **Simulate Wandering** in the dashboard.

> The dashboard URL defaults to `https://lovenialaw.github.io/cogniguide/#/`  
> Make sure GitHub Pages is serving the latest build (or change `DASHBOARD_URL` in `App.tsx` to your machine’s LAN URL while developing).

## Notifications that fire

| Event | Notification |
|-------|----------------|
| Fall detected | High-priority “Fall Detected” |
| Wandering alert | “Wandering Alert” |
| Strong WiFi node motion | “WiFi Node — Strong Motion” |

## Build a real APK (install without Expo Go)

```bash
npm install -g eas-cli
cd mobile
eas login
eas build -p android --profile preview
```

EAS returns a download link for an `.apk` you can install on your Android phone.

For iOS you’ll need an Apple Developer account and:

```bash
eas build -p ios --profile preview
```

## Project structure

```
mobile/
  App.tsx          # WebView shell + notification handler
  app.json         # Bundle IDs, notification plugin, permissions
  eas.json         # APK build profiles
```

Web dashboard bridge (parent project):

```
src/lib/nativeBridge.ts
src/components/AlertNotificationBridge.tsx
```

## Notes

- This is a **React Native Expo shell** around your existing React dashboard (fastest path to a real phone install + notifications).
- A full native rewrite of every screen would be a separate large project; this keeps all current features (charts, maps, WiFi nodes, chat) working immediately.
- Push notifications from a server (FCM/APNs) can be added later; local notifications already work offline once the alert is generated in-app.
