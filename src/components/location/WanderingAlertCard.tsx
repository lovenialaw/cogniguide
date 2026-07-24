import { motion } from "framer-motion";
import { AlertTriangle, MapPinned } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";

export function WanderingAlertCard() {
  const { wanderingAlert, simulateWandering } = usePatientData();

  // Hide this box while wandering is active — Emergency + notifications handle response
  if (wanderingAlert) return null;

  return (
    <GlassCard className="p-5 sm:p-6" glow="none">
      <CardHeader
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Wandering Alert"
        subtitle="Safe-zone departure monitoring"
        action={
          <button
            type="button"
            onClick={simulateWandering}
            className="text-[11px] font-semibold text-ink-400 hover:text-danger border border-ink-200 hover:border-danger/40 rounded-full px-3 py-1.5 transition-colors"
          >
            Simulate Wandering
          </button>
        }
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 rounded-2xl bg-mint-500/8 px-5 py-5"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint-500/15 text-mint-600">
          <MapPinned className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-ink-600">
          No wandering activity detected. Patient is within expected patterns.
        </p>
      </motion.div>
    </GlassCard>
  );
}
