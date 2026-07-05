import { motion } from "framer-motion";
import { Footprints, Gauge, Waypoints } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";

function ConfidenceRing({ value, color, icon }: { value: number; color: string; icon: React.ReactNode }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#e4e9f3" strokeWidth="9" />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <div className="mb-0.5" style={{ color }}>
          {icon}
        </div>
        <p className="font-display font-extrabold text-lg text-ink-900">{value}%</p>
      </div>
    </div>
  );
}

export function AIConfidenceCard() {
  const { aiConfidence } = usePatientData();

  return (
    <GlassCard className="p-6">
      <CardHeader icon={<Gauge className="h-5 w-5" />} title="AI Model Confidence" subtitle="Average accuracy across models" />

      <div className="flex items-center justify-around flex-wrap gap-6 py-2">
        <div className="flex flex-col items-center gap-3">
          <ConfidenceRing value={aiConfidence.fallDetection} color="#1487f5" icon={<Footprints className="h-5 w-5" />} />
          <p className="text-sm font-bold text-ink-700">Fall Detection AI</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <ConfidenceRing value={aiConfidence.wandering} color="#10bd85" icon={<Waypoints className="h-5 w-5" />} />
          <p className="text-sm font-bold text-ink-700">Wandering Detection AI</p>
        </div>
      </div>
    </GlassCard>
  );
}
