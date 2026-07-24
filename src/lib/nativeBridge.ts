export type NativeAlertPayload = {
  type: "cogniguide_alert";
  title: string;
  body: string;
  severity: "high" | "medium" | "low";
  category: "fall" | "wandering" | "wifi_motion" | "general";
  timestamp: string;
};

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export function isReactNativeWebView(): boolean {
  return typeof window !== "undefined" && !!window.ReactNativeWebView;
}

/** Send an alert to the React Native shell (and browser Notification API as fallback). */
export async function sendCareAlert(payload: Omit<NativeAlertPayload, "type" | "timestamp">) {
  const message: NativeAlertPayload = {
    type: "cogniguide_alert",
    timestamp: new Date().toISOString(),
    ...payload,
  };

  if (isReactNativeWebView()) {
    window.ReactNativeWebView!.postMessage(JSON.stringify(message));
  }

  // Also try browser / PWA notifications when not inside RN
  if (typeof Notification !== "undefined") {
    try {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
      if (Notification.permission === "granted") {
        new Notification(message.title, {
          body: message.body,
          tag: `${message.category}-${message.timestamp}`,
          icon: "/cogniguide/pwa-192.png",
        });
      }
    } catch {
      // Ignore notification failures in unsupported environments
    }
  }
}
