import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { ACTIVITY_RECOGNITION } from "@/lib/mockData";

export function ActivityRecognitionPie() {
  return (
    <GlassCard className="p-6">
      <CardHeader icon={<PieIcon className="h-5 w-5" />} title="Activity Recognition" subtitle="AI-classified activity distribution" />

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ACTIVITY_RECOGNITION}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              cornerRadius={6}
              isAnimationActive={false}
            >
              {ACTIVITY_RECOGNITION.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e4e9f3", fontSize: 12 }}
              formatter={(value) => [`${value}%`, ""]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: "#4a5876" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
