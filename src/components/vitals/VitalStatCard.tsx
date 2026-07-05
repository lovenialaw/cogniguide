import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface VitalStatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit: string;
  status: "normal" | "watch" | "elevated";
  tone: string;
  delay?: number;
}

const STATUS_STYLE: Record<VitalStatCardProps["status"], string> = {
  normal: "bg-mint-500/10 text-mint-700",
  watch: "bg-amber-glow/10 text-amber-700",
  elevated: "bg-danger/10 text-danger-dark",
};

const STATUS_LABEL: Record<VitalStatCardProps["status"], string> = {
  normal: "Normal",
  watch: "Monitor",
  elevated: "Elevated",
};

export function VitalStatCard({ icon, label, value, unit, status, tone, delay = 0 }: VitalStatCardProps) {
  return (
    <GlassCard className="p-5" delay={delay}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", tone)}>{icon}</div>
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", STATUS_STYLE[status])}>
          {STATUS_LABEL[status]}
        </span>
      </div>
      <p className="text-xs font-medium text-ink-400">{label}</p>
      <p className="font-display font-extrabold text-2xl text-ink-900 mt-1 tabular-nums">
        {value} <span className="text-sm font-semibold text-ink-400">{unit}</span>
      </p>
    </GlassCard>
  );
}
