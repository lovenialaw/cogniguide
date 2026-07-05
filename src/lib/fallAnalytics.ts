import type { AlertRecord, FallFrequencyPoint, FallTrendAssessment, FallTrendDirection } from "@/types";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Monday as the first day of the week */
function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return x;
}

function startOfMonth(d: Date): Date {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function getFallAlerts(alerts: AlertRecord[]): AlertRecord[] {
  return alerts.filter((a) => a.event === "Fall");
}

export function aggregateFallFrequency(
  alerts: AlertRecord[],
  period: "daily" | "weekly" | "monthly",
  now = new Date()
): FallFrequencyPoint[] {
  const falls = getFallAlerts(alerts);

  if (period === "daily") {
    return Array.from({ length: 7 }, (_, i) => {
      const offset = 6 - i;
      const dayStart = startOfDay(now);
      dayStart.setDate(dayStart.getDate() - offset);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const label =
        offset === 0
          ? "Today"
          : dayStart.toLocaleDateString("en-US", { weekday: "short" });
      const count = falls.filter((a) => a.timestamp >= dayStart && a.timestamp < dayEnd).length;
      return { label, falls: count };
    });
  }

  if (period === "weekly") {
    return Array.from({ length: 8 }, (_, i) => {
      const weeksAgo = 7 - i;
      const weekStart = startOfWeek(now);
      weekStart.setDate(weekStart.getDate() - weeksAgo * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const label = weeksAgo === 0 ? "This Wk" : `Wk ${i + 1}`;
      const count = falls.filter((a) => a.timestamp >= weekStart && a.timestamp < weekEnd).length;
      return { label, falls: count };
    });
  }

  return Array.from({ length: 6 }, (_, i) => {
    const monthsAgo = 5 - i;
    const monthStart = startOfMonth(now);
    monthStart.setMonth(monthStart.getMonth() - monthsAgo);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const label = monthStart.toLocaleDateString("en-US", { month: "short" });
    const count = falls.filter((a) => a.timestamp >= monthStart && a.timestamp < monthEnd).length;
    return { label, falls: count };
  });
}

function buildAssessment(
  direction: FallTrendDirection,
  recentTotal: number,
  priorTotal: number,
  percentChange: number | null
): Pick<FallTrendAssessment, "summary" | "recommendation" | "urgency"> {
  if (direction === "Increasing") {
    const urgency = recentTotal >= 4 ? "high" : recentTotal >= 2 ? "moderate" : "low";
    const pct = percentChange !== null && percentChange > 0 ? ` (${percentChange}% vs prior period)` : "";
    return {
      urgency,
      summary:
        recentTotal >= 3
          ? `Fall frequency is rising${pct}. This may indicate accelerating physical or cognitive decline.`
          : `Fall events are trending upward${pct}. Continued monitoring is advised.`,
      recommendation:
        urgency === "high"
          ? "Schedule a medical consultation promptly. Consider mobility aids, home safety review, and care plan adjustment."
          : "Recommend scheduling a medical consultation and reviewing the patient's mobility support plan.",
    };
  }

  if (direction === "Decreasing") {
    return {
      urgency: "none",
      summary: `Fall frequency has declined compared to the prior 4-week period (${priorTotal} → ${recentTotal} falls).`,
      recommendation: "Current interventions may be effective. Continue monitoring and maintain safety measures.",
    };
  }

  if (recentTotal === 0 && priorTotal === 0) {
    return {
      urgency: "none",
      summary: "No fall events recorded in the last 8 weeks.",
      recommendation: "Continue routine monitoring. Preventive measures remain important as Alzheimer's progresses.",
    };
  }

  return {
    urgency: recentTotal >= 3 ? "low" : "none",
    summary: `Fall frequency is stable (${recentTotal} falls in the last 4 weeks).`,
    recommendation:
      recentTotal >= 2
        ? "Pattern is unchanged but recurring falls warrant periodic clinical review."
        : "No significant change in fall patterns. Maintain current care and safety protocols.",
  };
}

export function assessFallTrend(alerts: AlertRecord[], now = new Date()): FallTrendAssessment {
  const weekly = aggregateFallFrequency(alerts, "weekly", now);
  const priorSlice = weekly.slice(0, 4);
  const recentSlice = weekly.slice(4, 8);

  const priorTotal = priorSlice.reduce((s, p) => s + p.falls, 0);
  const recentTotal = recentSlice.reduce((s, p) => s + p.falls, 0);
  const priorRate = priorTotal / 4;
  const recentRate = recentTotal / 4;

  let direction: FallTrendDirection;
  const changeThreshold = 0.25;

  if (recentTotal === 0 && priorTotal === 0) {
    direction = "Stable";
  } else if (priorRate === 0 && recentRate > 0) {
    direction = "Increasing";
  } else if (recentRate === 0 && priorRate > 0) {
    direction = "Decreasing";
  } else {
    const ratio = recentRate / priorRate;
    if (ratio >= 1 + changeThreshold) direction = "Increasing";
    else if (ratio <= 1 - changeThreshold) direction = "Decreasing";
    else direction = "Stable";
  }

  const percentChange =
    priorRate > 0 ? Math.round(((recentRate - priorRate) / priorRate) * 100) : recentRate > 0 ? 100 : null;

  const { summary, recommendation, urgency } = buildAssessment(direction, recentTotal, priorTotal, percentChange);

  return {
    direction,
    recentTotal,
    priorTotal,
    recentRate: Number(recentRate.toFixed(2)),
    priorRate: Number(priorRate.toFixed(2)),
    percentChange,
    summary,
    recommendation,
    urgency,
  };
}

export function countTotalFalls(alerts: AlertRecord[]): number {
  return getFallAlerts(alerts).length;
}
