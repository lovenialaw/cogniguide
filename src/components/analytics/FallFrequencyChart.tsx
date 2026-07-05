import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";
import { aggregateFallFrequency, countTotalFalls } from "@/lib/fallAnalytics";
import { cn } from "@/lib/utils";

const PERIODS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
] as const;

export function FallFrequencyChart() {
  const { alerts } = usePatientData();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("weekly");

  const data = useMemo(() => aggregateFallFrequency(alerts, period), [alerts, period]);
  const totalFalls = useMemo(() => countTotalFalls(alerts), [alerts]);
  const periodTotal = useMemo(() => data.reduce((sum, p) => sum + p.falls, 0), [data]);

  return (
    <GlassCard className="p-6">
      <CardHeader
        icon={<BarChart3 className="h-5 w-5" />}
        title="Fall Frequency"
        subtitle={`${totalFalls} falls logged · ${periodTotal} in selected period`}
        action={
          <div className="flex rounded-full bg-ink-100 p-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  period === p.key ? "bg-white text-brand-600 shadow-sm" : "text-ink-400"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke="#e4e9f3" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7794" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7794" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e4e9f3", fontSize: 12 }}
              cursor={{ fill: "rgba(20,135,245,0.06)" }}
              formatter={(value) => [`${value} fall${value === 1 ? "" : "s"}`, "Count"]}
            />
            <Bar dataKey="falls" fill="#1487f5" radius={[8, 8, 0, 0]} maxBarSize={44} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
