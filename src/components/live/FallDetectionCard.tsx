import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, PhoneCall, ShieldCheck, X, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";

export function FallDetectionCard() {
  const { motion: motionState, motionConfidence, fallDetected, fallEvent, simulateFall, dismissFall } = usePatientData();
  const navigate = useNavigate();

  return (
    <GlassCard className="p-6" glow={fallDetected ? "danger" : "none"}>
      <CardHeader
        icon={<Zap className="h-5 w-5" />}
        title="AI Fall Detection"
        subtitle="Continuous accelerometer + gyroscope inference"
        action={
          !fallDetected && (
            <button
              onClick={simulateFall}
              className="text-[11px] font-semibold text-ink-400 hover:text-danger border border-ink-200 hover:border-danger/40 rounded-full px-3 py-1.5 transition-colors"
            >
              Simulate Fall
            </button>
          )
        }
      />

      <AnimatePresence mode="wait">
        {!fallDetected ? (
          <motion.div
            key="normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
        ) : (
          <motion.div
            key="alert"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="rounded-2xl bg-danger/10 border border-danger/30 px-5 py-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger text-white shadow-glow-danger"
              >
                <AlertTriangle className="h-6 w-6" />
              </motion.div>
              <div>
                <p className="font-display font-extrabold text-xl text-danger-dark tracking-tight">⚠ FALL DETECTED</p>
                <p className="text-xs text-ink-500">Immediate caregiver attention required</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl bg-white/70 px-4 py-3">
                <p className="text-[11px] text-ink-400 uppercase tracking-wide">Impact Severity</p>
                <p className="font-bold text-danger-dark mt-0.5">{fallEvent?.severity ?? "High"}</p>
              </div>
              <div className="rounded-xl bg-white/70 px-4 py-3">
                <p className="text-[11px] text-ink-400 uppercase tracking-wide">Time</p>
                <p className="font-bold text-ink-800 mt-0.5">{fallEvent?.time}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/emergency")}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-danger text-white font-bold py-3 text-sm shadow-glow-danger hover:bg-danger-dark transition-colors"
              >
                <PhoneCall className="h-4 w-4" />
                Emergency
              </button>
              <button
                onClick={dismissFall}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white text-ink-600 font-bold py-3 text-sm border border-ink-200 hover:bg-ink-50 transition-colors"
              >
                <X className="h-4 w-4" />
                Dismiss Alert
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
