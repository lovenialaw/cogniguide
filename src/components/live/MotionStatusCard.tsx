import { motion } from "framer-motion";
import { AlertTriangle, Bed, Footprints, PersonStanding, Sofa } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";
import type { MotionState } from "@/types";

const MOTION_META: Record<MotionState, { icon: typeof Footprints; grad: string; ring: string }> = {
  Walking: { icon: Footprints, grad: "from-brand-400 to-brand-600", ring: "shadow-glow-brand" },
  Standing: { icon: PersonStanding, grad: "from-mint-400 to-mint-600", ring: "shadow-glow-mint" },
  Sitting: { icon: Sofa, grad: "from-amber-glow to-amber-600", ring: "shadow-glow-brand" },
  Sleeping: { icon: Bed, grad: "from-ink-400 to-ink-600", ring: "shadow-glass" },
  "Fall Detected": { icon: AlertTriangle, grad: "from-danger to-danger-dark", ring: "shadow-glow-danger" },
};

export function MotionStatusCard() {
  const { motion: motionState, motionConfidence } = usePatientData();
  const meta = MOTION_META[motionState];
  const Icon = meta.icon;
  const isFall = motionState === "Fall Detected";

  return (
    <GlassCard className="p-8 flex flex-col items-center justify-center text-center" glow={isFall ? "danger" : "none"}>
      <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-6">Motion Status</p>

      <motion.div
        animate={isFall ? { scale: [1, 1.08, 1] } : { y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: isFall ? 0.8 : 2.6, ease: "easeInOut" }}
        className={`flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br ${meta.grad} ${meta.ring}`}
      >
        <Icon className="h-14 w-14 text-white" strokeWidth={1.7} />
      </motion.div>

      <p className={`font-display font-extrabold text-3xl mt-6 tracking-tight ${isFall ? "text-danger-dark" : "text-ink-900"}`}>
        {motionState}
      </p>

      <div className="flex items-center gap-2 mt-3">
        <div className="h-2 w-32 rounded-full bg-ink-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${motionConfidence}%` }}
            className={`h-full rounded-full bg-gradient-to-r ${meta.grad}`}
          />
        </div>
        <span className="text-sm font-bold text-ink-600">{motionConfidence}%</span>
      </div>
      <p className="text-xs text-ink-400 mt-1">AI Confidence</p>
    </GlassCard>
  );
}
