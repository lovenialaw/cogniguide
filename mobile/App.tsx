import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

const DASHBOARD_URL = "https://lovenialaw.github.io/cogniguide/#/";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

type AlertMessage = {
  type: "cogniguide_alert";
  title: string;
  body: string;
  severity: "high" | "medium" | "low";
  category: string;
  timestamp: string;
};

async function ensureNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice && Platform.OS === "ios") {
    // Simulator may still allow local notifications on some versions
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function showLocalAlert(alert: AlertMessage) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: alert.title,
      body: alert.body,
      sound: true,
      data: {
        category: alert.category,
        severity: alert.severity,
        timestamp: alert.timestamp,
      },
      ...(Platform.OS === "android"
        ? {
            channelId: alert.severity === "high" ? "emergencies" : "care-alerts",
          }
        : {}),
    },
    trigger: null,
  });
}

async function setupAndroidChannels() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("emergencies", {
    name: "Emergencies",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#EF4444",
    sound: "default",
  });

  await Notifications.setNotificationChannelAsync("care-alerts", {
    name: "Care Alerts",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 100, 200],
    lightColor: "#1487F5",
    sound: "default",
  });
}

export default function App() {
  const webRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [notifOk, setNotifOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await setupAndroidChannels();
      const granted = await ensureNotificationPermission();
      if (mounted) {
        setNotifOk(granted);
        setReady(true);
      }

      if (granted) {
        await showLocalAlert({
          type: "cogniguide_alert",
          title: "COGNIGUIDE ready",
          body: "Care alerts are enabled. Fall, wandering, and strong WiFi motion will notify you.",
          severity: "low",
          category: "general",
          timestamp: new Date().toISOString(),
        });
      }
    })();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void Notifications.setBadgeCountAsync(0);
      }
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const onMessage = useCallback(async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as AlertMessage;
      if (data?.type !== "cogniguide_alert") return;
      await showLocalAlert(data);
    } catch {
      // Ignore non-JSON messages from the page
    }
  }, []);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#1487F5" />
        <Text style={styles.bootText}>Starting COGNIGUIDE…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F8FD" />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>
            COGNI<Text style={styles.brandAccent}>GUIDE</Text>
          </Text>
          <Text style={styles.sub}>
            {notifOk ? "Notifications on · caregiver app" : "Notifications blocked — enable in Settings"}
          </Text>
        </View>
        <Pressable
          style={styles.reload}
          onPress={() => {
            setError(null);
            setLoading(true);
            webRef.current?.reload();
          }}
        >
          <Text style={styles.reloadText}>Reload</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Could not load dashboard</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <Pressable
            style={styles.reload}
            onPress={() => {
              setError(null);
              setLoading(true);
              webRef.current?.reload();
            }}
          >
            <Text style={styles.reloadText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.webWrap}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#1487F5" />
            </View>
          )}
          <WebView
            ref={webRef}
            source={{ uri: DASHBOARD_URL }}
            style={styles.webview}
            onMessage={onMessage}
            onLoadEnd={() => setLoading(false)}
            onError={(e) => {
              setLoading(false);
              setError(e.nativeEvent.description || "Network error");
            }}
            onHttpError={(e) => {
              if (e.nativeEvent.statusCode >= 400) {
                setError(`HTTP ${e.nativeEvent.statusCode}`);
              }
            }}
            allowsBackForwardNavigationGestures
            javaScriptEnabled
            domStorageEnabled
            mediaPlaybackRequiresUserAction={false}
            setSupportMultipleWindows={false}
            applicationNameForUserAgent={`COGNIGUIDE/${Constants.expoConfig?.version ?? "1.0"}`}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F8FD" },
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F8FD",
    gap: 12,
  },
  bootText: { color: "#4A5876", fontWeight: "600" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E9F3",
    backgroundColor: "rgba(255,255,255,0.92)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { fontSize: 18, fontWeight: "800", color: "#0B1220" },
  brandAccent: { color: "#1487F5" },
  sub: { marginTop: 2, fontSize: 11, color: "#6B7794", fontWeight: "600" },
  reload: {
    backgroundColor: "#1487F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  reloadText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  webWrap: { flex: 1 },
  webview: { flex: 1, backgroundColor: "#F4F8FD" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244,248,253,0.7)",
  },
  errorBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  errorTitle: { fontSize: 16, fontWeight: "800", color: "#0B1220" },
  errorBody: { fontSize: 13, color: "#6B7794", textAlign: "center" },
});
