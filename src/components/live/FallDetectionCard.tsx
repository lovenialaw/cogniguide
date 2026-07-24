import { motion } from "framer-motion";
import { ShieldCheck, Zap } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";

export function FallDetectionCard() {
  const { motion: motionState, motionConfidence, fallDetected, simulateFall } = usePatientData();

  // Hide this box while a fall is active — Emergency + notifications handle response
  if (fallDetected) return null;

  return (
    <GlassCard className="p-5 sm:p-6" glow="none">
      <CardHeader
        icon={<Zap className="h-5 w-5" />}
        title="AI Fall Detection"
        subtitle="Watch IMU monitoring"
        action={
          <button
            type="button"
            onClick={simulateFall}
            className="text-[11px] font-semibold text-ink-400 hover:text-danger border border-ink-200 hover:border-danger/40 rounded-full px-3 py-1.5 transition-colors"
          >
            Simulate Fall
          </button>
        }
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between rounded-2xl bg-mint-500/8 px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint-500/15 text-mint-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-ink-400 uppercase tracking-wide font-medium">Current Activity</p>
            <p className="font-bold text-ink-800">{motionState}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-ink-400 uppercase tracking-wide font-medium">Confidence</p>
          <p className="font-display font-extrabold text-2xl text-mint-600">{motionConfidence}%</p>
        </div>
      </motion.div>
    </GlassCard>
  );
}
