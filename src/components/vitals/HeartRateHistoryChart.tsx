import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { HeartPulse } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { generateDailyHeartRate, generateHeartRateHistory } from "@/lib/mockData";
import { usePatientData } from "@/context/PatientDataContext";
import { cn } from "@/lib/utils";

const RANGES = [
  { key: "24h", label: "24 Hours" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
] as const;

export function HeartRateHistoryChart() {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("24h");
  const { heartRateHistory } = usePatientData();

  const data = useMemo(() => {
    if (range === "24h") return heartRateHistory;
    if (range === "7d") return generateHeartRateHistory(24, 180);
    return generateDailyHeartRate(30);
  }, [range, heartRateHistory]);

  return (
    <GlassCard className="p-6">
      <CardHeader
        icon={<HeartPulse className="h-5 w-5" />}
        title="Heart Rate History"
        subtitle="Beats per minute over time"
        action={
          <div className="flex rounded-full bg-ink-100 p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  range === r.key ? "bg-white text-brand-600 shadow-sm" : "text-ink-400"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="vitalsHrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e4e9f3" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#6b7794" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={[50, 120]} tick={{ fontSize: 11, fill: "#6b7794" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e9f3", fontSize: 12 }} />
            <Area type="monotone" dataKey="bpm" stroke="#ef4444" strokeWidth={2.5} fill="url(#vitalsHrGradient)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
