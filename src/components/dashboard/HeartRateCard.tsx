import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { ArrowDown, ArrowUp, HeartPulse } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";

export function HeartRateCard() {
  const { heartRate, heartRateHistory, heartRateMin, heartRateMax } = usePatientData();
  const isNormal = heartRate >= 60 && heartRate <= 100;

  return (
    <GlassCard className="p-6" delay={0.1}>
      <CardHeader
        icon={<HeartPulse className="h-5 w-5" />}
        title="Heart Rate"
        subtitle="Last 24 hours"
        action={
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              isNormal ? "bg-mint-500/10 text-mint-700" : "bg-danger/10 text-danger-dark"
            }`}
          >
            {isNormal ? "Normal Range" : "Out of Range"}
          </span>
        }
      />

      <div className="flex items-end gap-2 mb-2">
        <span className="font-display text-4xl font-extrabold text-ink-900 tabular-nums">{heartRate}</span>
        <span className="text-sm font-semibold text-ink-400 mb-1.5">BPM</span>
        <HeartPulse className="h-5 w-5 text-danger mb-1.5 ml-1 animate-pulse-slow" fill="currentColor" />
      </div>

      <div className="h-20 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={heartRateHistory} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={[50, 120]} hide />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e4e9f3", fontSize: 12 }}
              labelStyle={{ color: "#6b7794" }}
              formatter={(v) => [`${v} bpm`, "Heart Rate"]}
            />
            <Area type="monotone" dataKey="bpm" stroke="#ef4444" strokeWidth={2} fill="url(#hrGradient)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3 pt-4 border-t border-ink-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-danger/10 text-danger">
            <ArrowUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-ink-400">Highest Today</p>
            <p className="text-sm font-bold text-ink-800">{heartRateMax} BPM</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
            <ArrowDown className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-ink-400">Lowest Today</p>
            <p className="text-sm font-bold text-ink-800">{heartRateMin} BPM</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
