import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, MapPinned, PhoneCall, PhoneOutgoing, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";
import { useCareActions } from "@/hooks/useCareActions";

export function WanderingAlertCard() {
  const { wanderingAlert, simulateWandering, dismissWandering } = usePatientData();
  const { callPatient, notifyCaregiverOfAlert } = useCareActions();
  const navigate = useNavigate();

  if (wanderingAlert) {
    return (
      <GlassCard className="p-5 sm:p-6" glow="danger">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-danger/10 border border-danger/30 px-4 sm:px-5 py-5"
        >
          <div className="flex items-start gap-3 mb-5">
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-danger text-white shadow-glow-danger"
            >
              <AlertTriangle className="h-6 w-6" />
            </motion.div>
            <div className="min-w-0">
              <p className="font-display font-extrabold text-lg sm:text-xl text-danger-dark tracking-tight">
                Possible wandering
              </p>
              <p className="text-xs text-ink-500 mt-0.5">
                {wanderingAlert.time} · {wanderingAlert.confidence}% · {wanderingAlert.durationMinutes} min away
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/emergency")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-danger text-white font-bold py-3.5 text-sm shadow-glow-danger hover:bg-danger-dark transition-colors"
            >
              <PhoneCall className="h-4 w-4" />
              Emergency
            </button>
            <button
              type="button"
              onClick={() => navigate("/location")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink-800 text-white font-bold py-3.5 text-sm hover:bg-ink-900 transition-colors"
            >
              <MapPinned className="h-4 w-4" />
              View Map
            </button>
            <button
              type="button"
              onClick={callPatient}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 text-white font-bold py-3.5 text-sm hover:bg-brand-600 transition-colors"
            >
              <PhoneCall className="h-4 w-4" />
              Call Patient
            </button>
            <button
              type="button"
              onClick={notifyCaregiverOfAlert}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-ink-600 font-bold py-3.5 text-sm border border-ink-200 hover:bg-ink-50 transition-colors"
            >
              <PhoneOutgoing className="h-4 w-4" />
              Notify Caregiver
            </button>
            <button
              type="button"
              onClick={dismissWandering}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-ink-500 font-bold py-3.5 text-sm border border-ink-100 hover:bg-ink-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Dismiss Alert
            </button>
          </div>
        </motion.div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6" glow="none">
      <CardHeader
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Wandering Alert"
        subtitle="Departure detection"
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

      <AnimatePresence mode="wait">
        <motion.div
          key="ok"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-3 rounded-2xl bg-mint-500/8 px-5 py-5"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint-500/15 text-mint-600">
            <MapPinned className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-ink-600">
            No wandering activity. Movements look normal.
          </p>
        </motion.div>
      </AnimatePresence>
    </GlassCard>
  );
}
