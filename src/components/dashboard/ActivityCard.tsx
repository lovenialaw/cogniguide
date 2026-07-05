import { Bed, Footprints, Sofa, Timer } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function ActivityCard() {
  const { activity } = usePatientData();
  const stepPct = Math.min(100, Math.round((activity.steps / activity.stepGoal) * 100));

  const stats = [
    {
      label: "Steps",
      value: activity.steps.toLocaleString(),
      icon: Footprints,
      tone: "text-brand-600 bg-brand-500/10",
    },
    {
      label: "Walking Time",
      value: formatMinutes(activity.walkingMinutes),
      icon: Timer,
      tone: "text-mint-600 bg-mint-500/10",
    },
    {
      label: "Sitting Time",
      value: formatMinutes(activity.sittingMinutes),
      icon: Sofa,
      tone: "text-amber-600 bg-amber-glow/10",
    },
    {
      label: "Sleep Hours",
      value: `${activity.sleepHours}h`,
      icon: Bed,
      tone: "text-ink-500 bg-ink-100",
    },
  ];

  return (
    <GlassCard className="p-6" delay={0.15}>
      <CardHeader icon={<Footprints className="h-5 w-5" />} title="Activity Summary" subtitle="Today's movement overview" />

      <div className="mb-5">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-500 mb-1.5">
          <span>Step Goal Progress</span>
          <span>{stepPct}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-ink-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-mint-400 transition-all duration-700"
            style={{ width: `${stepPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl bg-ink-50 px-3.5 py-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-ink-400 truncate">{label}</p>
              <p className="text-sm font-bold text-ink-800 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
