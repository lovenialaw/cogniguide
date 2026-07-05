import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import type { AxisPoint } from "@/types";
import type { ReactNode } from "react";

interface AxisLineChartProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  data: AxisPoint[];
  domain: [number, number];
  unit: string;
  labels: [string, string, string];
}

const COLORS = ["#1487f5", "#10bd85", "#f59e0b"];

export function AxisLineChart({ icon, title, subtitle, data, domain, unit, labels }: AxisLineChartProps) {
  const last = data[data.length - 1];

  return (
    <GlassCard className="p-6">
      <CardHeader icon={icon} title={title} subtitle={subtitle} />

      <div className="flex gap-4 mb-3">
        {(["x", "y", "z"] as const).map((axis, i) => (
          <div key={axis} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: COLORS[i] }}>
            <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
            {labels[i]}: {last[axis]} {unit}
          </div>
        ))}
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <YAxis domain={domain} hide />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e4e9f3", fontSize: 12 }}
              labelFormatter={() => ""}
            />
            <Line type="monotone" dataKey="x" stroke={COLORS[0]} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="y" stroke={COLORS[1]} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="z" stroke={COLORS[2]} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
