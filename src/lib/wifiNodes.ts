import type { PatientPosition } from "@/lib/locationSimulation";

export type NodeMotionState = "quiet" | "motion" | "strong";

export interface WifiNode {
  id: string;
  label: string;
  room: string;
  x: number;
  y: number;
  frequencyHz: number;
}

export interface WifiNodeLive extends WifiNode {
  intensity: number;
  state: NodeMotionState;
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

export const DEFAULT_WIFI_NODES: WifiNode[] = [
  { id: "N1", label: "Node 1", room: "Living Room", x: 22, y: 24, frequencyHz: 24 },
  { id: "N2", label: "Node 2", room: "Kitchen", x: 78, y: 24, frequencyHz: 24 },
  { id: "N3", label: "Node 3", room: "Bedroom", x: 22, y: 76, frequencyHz: 24 },
  { id: "N4", label: "Node 4", room: "Bathroom", x: 78, y: 76, frequencyHz: 24 },
  { id: "N5", label: "Node 5", room: "Hallway", x: 50, y: 52, frequencyHz: 24 },
  { id: "N6", label: "Node 6", room: "Near Exit", x: 50, y: 12, frequencyHz: 24 },
];

export function intensityFromDistance(distance: number, moving: boolean): number {
  // Closer nodes see stronger motion. Moving amplifies the signal.
  const base = Math.max(0, 1 - distance / 42);
  const amp = moving ? 1.35 : 0.75;
  return Math.min(3.5, +(base * amp * 3.2 + 0.85).toFixed(2));
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
    const intensity = intensityFromDistance(distance(patient, node), moving);
    return {
      ...node,
      intensity,
      state: stateFromIntensity(intensity),
    };
  });
}

/** Weighted centroid of nodes that currently see motion — the activity blob. */
export function activityCentroid(nodes: WifiNodeLive[]): PatientPosition | null {
  const active = nodes.filter((n) => n.state !== "quiet");
  if (active.length === 0) return null;

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

/** Seed historical motion events across recent hours/days for log filtering. */
export function seedMotionLogEvents(now = new Date()): NodeMotionEvent[] {
  const samples: Array<{
    minutesAgo: number;
    nodeId: string;
    room: string;
    state: NodeMotionState;
    intensity: number;
  }> = [
    { minutesAgo: 2, nodeId: "N1", room: "Living Room", state: "motion", intensity: 2.1 },
    { minutesAgo: 8, nodeId: "N5", room: "Hallway", state: "motion", intensity: 1.9 },
    { minutesAgo: 18, nodeId: "N2", room: "Kitchen", state: "strong", intensity: 2.9 },
    { minutesAgo: 35, nodeId: "N3", room: "Bedroom", state: "motion", intensity: 1.7 },
    { minutesAgo: 55, nodeId: "N4", room: "Bathroom", state: "motion", intensity: 2.0 },
    { minutesAgo: 90, nodeId: "N1", room: "Living Room", state: "strong", intensity: 3.1 },
    { minutesAgo: 140, nodeId: "N5", room: "Hallway", state: "motion", intensity: 1.8 },
    { minutesAgo: 220, nodeId: "N6", room: "Near Exit", state: "strong", intensity: 2.8 },
    { minutesAgo: 360, nodeId: "N2", room: "Kitchen", state: "motion", intensity: 2.2 },
    { minutesAgo: 480, nodeId: "N3", room: "Bedroom", state: "motion", intensity: 1.6 },
    { minutesAgo: 720, nodeId: "N1", room: "Living Room", state: "motion", intensity: 2.0 },
    { minutesAgo: 1080, nodeId: "N5", room: "Hallway", state: "motion", intensity: 1.9 },
    { minutesAgo: 1440 + 60, nodeId: "N2", room: "Kitchen", state: "strong", intensity: 2.7 },
    { minutesAgo: 1440 + 300, nodeId: "N4", room: "Bathroom", state: "motion", intensity: 1.8 },
    { minutesAgo: 1440 * 2 + 90, nodeId: "N1", room: "Living Room", state: "motion", intensity: 2.3 },
    { minutesAgo: 1440 * 3 + 200, nodeId: "N3", room: "Bedroom", state: "motion", intensity: 1.7 },
    { minutesAgo: 1440 * 5 + 40, nodeId: "N6", room: "Near Exit", state: "strong", intensity: 3.0 },
    { minutesAgo: 1440 * 6 + 180, nodeId: "N5", room: "Hallway", state: "motion", intensity: 2.1 },
  ];

  return samples.map((s, i) => {
    const timestamp = new Date(now.getTime() - s.minutesAgo * 60_000);
    return {
      id: `seed-${i}-${s.nodeId}`,
      nodeId: s.nodeId,
      nodeLabel: `Node ${s.nodeId.slice(1)}`,
      room: s.room,
      state: s.state,
      intensity: s.intensity,
      message: `${s.state === "strong" ? "Strong motion" : "Motion"} detected — ${s.room}`,
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
