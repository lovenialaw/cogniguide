import type {
  ActivityRecognitionSlice,
  AlertRecord,
  AxisPoint,
  HeartRatePoint,
} from "@/types";

export function generateHeartRateHistory(hours: number, intervalMinutes: number): HeartRatePoint[] {
  const points: HeartRatePoint[] = [];
  const now = new Date();
  const count = Math.floor((hours * 60) / intervalMinutes);
  let bpm = 74;
  for (let i = count; i >= 0; i--) {
    const t = new Date(now.getTime() - i * intervalMinutes * 60000);
    bpm += (Math.random() - 0.5) * 6;
    bpm = Math.min(102, Math.max(58, bpm));
    // gentle circadian dip at night
    const hour = t.getHours();
    const nightDip = hour >= 1 && hour <= 5 ? -8 : 0;
    points.push({
      time: t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      bpm: Math.round(bpm + nightDip),
    });
  }
  return points;
}

export function generateDailyHeartRate(days: number): HeartRatePoint[] {
  const points: HeartRatePoint[] = [];
  const now = new Date();
  let base = 75;
  for (let i = days; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 86400000);
    base += (Math.random() - 0.5) * 3;
    base = Math.min(88, Math.max(66, base));
    points.push({
      time: t.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      bpm: Math.round(base),
    });
  }
  return points;
}

export function generateAxisWindow(count: number, amplitude: number, offset = 0): AxisPoint[] {
  const points: AxisPoint[] = [];
  const now = Date.now();
  for (let i = count; i >= 0; i--) {
    points.push({
      time: new Date(now - i * 500).toLocaleTimeString("en-US", {
        minute: "2-digit",
        second: "2-digit",
      }),
      x: Number((Math.sin(i / 3) * amplitude + offset + (Math.random() - 0.5) * 0.3).toFixed(2)),
      y: Number((Math.cos(i / 4) * amplitude + offset + (Math.random() - 0.5) * 0.3).toFixed(2)),
      z: Number((Math.sin(i / 5 + 1) * amplitude + offset + (Math.random() - 0.5) * 0.3).toFixed(2)),
    });
  }
  return points;
}

export const ACTIVITY_RECOGNITION: ActivityRecognitionSlice[] = [
  { name: "Walking", value: 28, color: "#1487f5" },
  { name: "Sleeping", value: 34, color: "#0d3a70" },
  { name: "Sitting", value: 22, color: "#10bd85" },
  { name: "Standing", value: 11, color: "#f59e0b" },
  { name: "Other", value: 5, color: "#c3cbdd" },
];

export function generateAlertHistory(): AlertRecord[] {
  const now = new Date();
  let idx = 0;

  const mk = (
    minsAgo: number,
    event: AlertRecord["event"],
    severity: AlertRecord["severity"],
    status: AlertRecord["status"]
  ): AlertRecord => {
    const t = new Date(now.getTime() - minsAgo * 60000);
    return {
      id: `alert-${idx++}`,
      time: t.toLocaleString("en-US", {
        month: minsAgo > 1440 ? "short" : undefined,
        day: minsAgo > 1440 ? "numeric" : undefined,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      timestamp: t,
      event,
      severity,
      status,
    };
  };

  const d = (days: number) => days * 24 * 60;

  // Falls are spread across 8 weeks so trend analytics reflect a realistic increasing pattern.
  return [
    mk(15, "Fall", "High", "Resolved"),
    mk(d(2), "Fall", "Medium", "Resolved"),
    mk(d(5), "Fall", "Low", "Resolved"),
    mk(95, "Left Home", "Medium", "Resolved"),
    mk(d(10), "Fall", "Low", "Resolved"),
    mk(190, "Irregular Heart Rate", "Low", "Resolved"),
    mk(d(21), "Fall", "Medium", "Resolved"),
    mk(520, "Low Battery", "Low", "Resolved"),
    mk(d(38), "Fall", "Low", "Resolved"),
    mk(700, "Left Home", "Medium", "Resolved"),
    mk(d(52), "Fall", "Low", "Resolved"),
    mk(1600, "Irregular Heart Rate", "Low", "Dismissed"),
  ];
}
