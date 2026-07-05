import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertCircle, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";
import { aggregateFallFrequency, assessFallTrend } from "@/lib/fallAnalytics";
import type { FallTrendAssessment } from "@/types";
import { cn } from "@/lib/utils";

const TREND_UI: Record<
  FallTrendAssessment["direction"],
  { icon: typeof TrendingUp; badge: string; badgeText: string; stroke: string; hint: string }
> = {
  Increasing: {
    icon: TrendingUp,
    badge: "bg-danger/10 text-danger-dark",
    badgeText: "Increasing",
    stroke: "#ef4444",
    hint: "Potential mobility decline detected",
  },
  Stable: {
    icon: Minus,
    badge: "bg-brand-500/10 text-brand-700",
    badgeText: "Stable",
    stroke: "#1487f5",
    hint: "Fall pattern unchanged over the last 8 weeks",
  },
  Decreasing: {
    icon: TrendingDown,
    badge: "bg-mint-500/10 text-mint-700",
    badgeText: "Decreasing",
    stroke: "#10bd85",
    hint: "Fall frequency is improving compared to prior weeks",
  },
};

const URGENCY_UI: Record<FallTrendAssessment["urgency"], { box: string; title: string; icon: string }> = {
  high: { box: "bg-danger/10 border-danger/25", title: "text-danger-dark", icon: "text-danger-dark" },
  moderate: { box: "bg-amber-glow/10 border-amber-glow/25", title: "text-amber-700", icon: "text-amber-600" },
  low: { box: "bg-brand-500/8 border-brand-500/20", title: "text-brand-700", icon: "text-brand-600" },
  none: { box: "bg-mint-500/8 border-mint-500/20", title: "text-mint-700", icon: "text-mint-600" },
};

export function TrendAnalysisChart() {
  const { alerts } = usePatientData();
  const data = useMemo(() => aggregateFallFrequency(alerts, "weekly"), [alerts]);
  const assessment = useMemo(() => assessFallTrend(alerts), [alerts]);
  const trend = TREND_UI[assessment.direction];
  const urgency = URGENCY_UI[assessment.urgency];
  const TrendIcon = trend.icon;

  return (
    <GlassCard className="p-6">
      <CardHeader icon={<TrendingUp className="h-5 w-5" />} title="AI Trend Analysis" subtitle="Weekly fall frequency trend" />

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={cn("flex items-center gap-1 rounded-full text-xs font-bold px-3 py-1", trend.badge)}>
          <TrendIcon className="h-3.5 w-3.5" /> {trend.badgeText}
          {assessment.percentChange !== null && assessment.direction === "Increasing" && assessment.percentChange > 0 && (
            <span className="opacity-80">+{assessment.percentChange}%</span>
          )}
        </span>
        <span className="text-xs text-ink-400">{trend.hint}</span>
      </div>

      <div className="flex gap-4 mb-3 text-xs font-semibold text-ink-500">
        <span>
          Prior 4 wks: <strong className="text-ink-800">{assessment.priorTotal}</strong> falls
        </span>
        <span>
          Recent 4 wks: <strong className="text-ink-800">{assessment.recentTotal}</strong> falls
        </span>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={trend.stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={trend.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e4e9f3" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7794" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7794" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e4e9f3", fontSize: 12 }}
              formatter={(value) => [`${value} fall${value === 1 ? "" : "s"}`, "Count"]}
            />
            <Area
              type="monotone"
              dataKey="falls"
              stroke={trend.stroke}
              strokeWidth={2.5}
              fill="url(#trendGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={cn("flex items-start gap-3 rounded-2xl border px-4 py-3.5 mt-2", urgency.box)}>
        <AlertCircle className={cn("h-5 w-5 shrink-0 mt-0.5", urgency.icon)} />
        <div>
          <p className={cn("text-sm font-bold", urgency.title)}>AI Assessment</p>
          <p className="text-xs text-ink-600 mt-0.5">{assessment.summary}</p>
          <p className="text-xs text-ink-500 mt-1.5 font-medium">{assessment.recommendation}</p>
        </div>
      </div>
    </GlassCard>
  );
}
