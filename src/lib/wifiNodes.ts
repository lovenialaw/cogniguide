import type { PatientPosition } from "@/lib/locationSimulation";
import type { GeofenceState, RoomName } from "@/types";

export type NodeMotionState = "quiet" | "motion" | "strong";

export interface WifiNode {
  id: string;
  label: string;
  room: string;
  x: number;
  y: number;
  /** Simulated Wi-Fi RSSI of the smartwatch as seen by this ESP32 (dBm) */
  frequencyHz: number;
}

export interface WifiNodeLive extends WifiNode {
  intensity: number;
  state: NodeMotionState;
  /** Estimated RSSI from smartwatch → this ESP32 node */
  rssiDbm: number;
}

export interface NodeMotionEvent {
  id: string;
  nodeId: string;
  nodeLabel: string;
  room: string;
  state: NodeMotionState;
  intensity: number;
  message: string;
  timestamp: Date;
}

/** Four ESP32 home nodes — RSSI from the smartwatch is used for indoor localization. */
export const DEFAULT_WIFI_NODES: WifiNode[] = [
  { id: "ESP32-1", label: "ESP32-1", room: "Living Room", x: 24, y: 26, frequencyHz: 24 },
  { id: "ESP32-2", label: "ESP32-2", room: "Kitchen", x: 76, y: 26, frequencyHz: 24 },
  { id: "ESP32-3", label: "ESP32-3", room: "Bedroom", x: 24, y: 74, frequencyHz: 24 },
  { id: "ESP32-4", label: "ESP32-4", room: "Bathroom", x: 76, y: 74, frequencyHz: 24 },
];

export type DualVerifyStatus = "idle" | "pending" | "confirmed" | "watch_only";

export function intensityFromDistance(distance: number, moving: boolean): number {
  const base = Math.max(0, 1 - distance / 42);
  const amp = moving ? 1.35 : 0.75;
  return Math.min(3.5, +(base * amp * 3.2 + 0.85).toFixed(2));
}

/** Map distance to RSSI (closer = stronger / less negative). */
export function rssiFromDistance(distance: number): number {
  // ~ -40 dBm at node, ~ -85 dBm across the home
  return Math.round(Math.min(-38, Math.max(-88, -40 - distance * 0.7)));
}

export function stateFromIntensity(intensity: number): NodeMotionState {
  if (intensity >= 2.6) return "strong";
  if (intensity >= 1.6) return "motion";
  return "quiet";
}

export function distance(a: PatientPosition, b: PatientPosition): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function computeLiveNodes(
  nodes: WifiNode[],
  patient: PatientPosition,
  moving: boolean
): WifiNodeLive[] {
  return nodes.map((node) => {
    const d = distance(patient, node);
    const intensity = intensityFromDistance(d, moving);
    return {
      ...node,
      intensity,
      // CSI motion state tracks movement; RSSI stays distance-based for localization
      state: moving ? stateFromIntensity(intensity) : "quiet",
      rssiDbm: rssiFromDistance(d),
    };
  });
}

export function strongestNode(nodes: WifiNodeLive[]): WifiNodeLive | null {
  if (nodes.length === 0) return null;
  return [...nodes].sort((a, b) => b.rssiDbm - a.rssiDbm)[0];
}

/**
 * Fall dual-verify:
 * Watch reports fall → home ESP32 nodes confirm the patient stays motionless
 * (low CSI motion / quiet nearest node) before caregivers are alerted.
 */
export function verifyFallConsensus(opts: {
  fallDetected: boolean;
  isMoving: boolean;
  nodes: WifiNodeLive[];
}): DualVerifyStatus {
  if (!opts.fallDetected) return "idle";
  const nearest = strongestNode(opts.nodes);
  if (!nearest) return "watch_only";

  // Nodes agree the wearer is still after impact (all CSI quiet)
  const nodesSeeStillness = !opts.isMoving && opts.nodes.every((n) => n.state === "quiet");
  return nodesSeeStillness ? "confirmed" : "pending";
}

/**
 * Wandering dual-verify:
 * Watch / geofence flags departure → home nodes must also see presence near the
 * exit side of the home (strong RSSI while geofence is Near Exit / Outside).
 */
export function verifyWanderingConsensus(opts: {
  wanderingAlert: boolean;
  geofence: GeofenceState;
  room: RoomName;
  nodes: WifiNodeLive[];
  patientPos: PatientPosition;
}): DualVerifyStatus {
  if (!opts.wanderingAlert) return "idle";
  const nearest = strongestNode(opts.nodes);
  if (!nearest) return "watch_only";

  const exitSide = opts.geofence !== "Inside Home" || opts.patientPos.y < 28;
  const nodesSeePresence = nearest.state !== "quiet" || nearest.rssiDbm > -62;
  return exitSide && nodesSeePresence ? "confirmed" : "pending";
}

export function activityCentroid(nodes: WifiNodeLive[]): PatientPosition | null {
  const active = nodes.filter((n) => n.state !== "quiet");
  if (active.length === 0) {
    const nearest = strongestNode(nodes);
    return nearest ? { x: nearest.x, y: nearest.y } : null;
  }

  let wx = 0;
  let wy = 0;
  let w = 0;
  for (const n of active) {
    const weight = n.intensity;
    wx += n.x * weight;
    wy += n.y * weight;
    w += weight;
  }
  return { x: wx / w, y: wy / w };
}

export function clampPercent(v: number): number {
  return Math.min(92, Math.max(8, v));
}

export function seedMotionLogEvents(now = new Date()): NodeMotionEvent[] {
  const samples: Array<{
    minutesAgo: number;
    nodeId: string;
    room: string;
    state: NodeMotionState;
    intensity: number;
  }> = [
    { minutesAgo: 2, nodeId: "ESP32-1", room: "Living Room", state: "motion", intensity: 2.1 },
    { minutesAgo: 18, nodeId: "ESP32-2", room: "Kitchen", state: "strong", intensity: 2.9 },
    { minutesAgo: 35, nodeId: "ESP32-3", room: "Bedroom", state: "motion", intensity: 1.7 },
    { minutesAgo: 55, nodeId: "ESP32-4", room: "Bathroom", state: "motion", intensity: 2.0 },
    { minutesAgo: 90, nodeId: "ESP32-1", room: "Living Room", state: "strong", intensity: 3.1 },
    { minutesAgo: 220, nodeId: "ESP32-2", room: "Kitchen", state: "motion", intensity: 2.2 },
    { minutesAgo: 480, nodeId: "ESP32-3", room: "Bedroom", state: "motion", intensity: 1.6 },
    { minutesAgo: 720, nodeId: "ESP32-1", room: "Living Room", state: "motion", intensity: 2.0 },
    { minutesAgo: 1440 + 60, nodeId: "ESP32-2", room: "Kitchen", state: "strong", intensity: 2.7 },
    { minutesAgo: 1440 + 300, nodeId: "ESP32-4", room: "Bathroom", state: "motion", intensity: 1.8 },
    { minutesAgo: 1440 * 2 + 90, nodeId: "ESP32-1", room: "Living Room", state: "motion", intensity: 2.3 },
    { minutesAgo: 1440 * 3 + 200, nodeId: "ESP32-3", room: "Bedroom", state: "motion", intensity: 1.7 },
  ];

  return samples.map((s, i) => {
    const timestamp = new Date(now.getTime() - s.minutesAgo * 60_000);
    return {
      id: `seed-${i}-${s.nodeId}`,
      nodeId: s.nodeId,
      nodeLabel: s.nodeId,
      room: s.room,
      state: s.state,
      intensity: s.intensity,
      message: `${s.state === "strong" ? "Strong CSI motion" : "CSI motion"} — ${s.room}`,
      timestamp,
    };
  });
}

export type DateInterval = "all" | "today" | "yesterday" | "7d" | "custom";

export function filterMotionEvents(
  events: NodeMotionEvent[],
  dateInterval: DateInterval,
  customFrom?: string,
  customTo?: string,
  now = new Date()
): NodeMotionEvent[] {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  return events.filter((evt) => {
    const t = evt.timestamp.getTime();

    if (dateInterval === "today") {
      if (t < startOfDay(now).getTime()) return false;
    } else if (dateInterval === "yesterday") {
      const today = startOfDay(now).getTime();
      const yesterday = today - 24 * 60 * 60_000;
      if (t < yesterday || t >= today) return false;
    } else if (dateInterval === "7d") {
      if (t < now.getTime() - 7 * 24 * 60 * 60_000) return false;
    } else if (dateInterval === "custom") {
      if (customFrom) {
        const from = new Date(`${customFrom}T00:00:00`).getTime();
        if (t < from) return false;
      }
      if (customTo) {
        const to = new Date(`${customTo}T23:59:59`).getTime();
        if (t > to) return false;
      }
    }

    return true;
  });
}
