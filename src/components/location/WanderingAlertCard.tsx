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

  return (
    <GlassCard className="p-6" glow={wanderingAlert ? "danger" : "none"}>
      <CardHeader
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Wandering Alert"
        subtitle="AI-based departure detection"
        action={
          !wanderingAlert && (
            <button
              onClick={simulateWandering}
              className="text-[11px] font-semibold text-ink-400 hover:text-danger border border-ink-200 hover:border-danger/40 rounded-full px-3 py-1.5 transition-colors"
            >
              Simulate Wandering
            </button>
          )
        }
      />

      <AnimatePresence mode="wait">
        {!wanderingAlert ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl bg-mint-500/8 px-5 py-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint-500/15 text-mint-600">
              <MapPinned className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-ink-600">No wandering activity detected. Patient movements are within expected patterns.</p>
          </motion.div>
        ) : (
          <motion.div
            key="alert"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-danger/10 border border-danger/30 px-5 py-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger text-white shadow-glow-danger"
              >
                <AlertTriangle className="h-6 w-6" />
              </motion.div>
              <div>
                <p className="font-display font-extrabold text-lg text-danger-dark tracking-tight">
                  ⚠ Possible Wandering Detected
                </p>
                <p className="text-xs text-ink-500">Patient has been outside the safe zone</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="rounded-xl bg-white/70 px-3 py-3">
                <p className="text-[10px] text-ink-400 uppercase tracking-wide">Time</p>
                <p className="font-bold text-ink-800 mt-0.5 text-sm">{wanderingAlert.time}</p>
              </div>
              <div className="rounded-xl bg-white/70 px-3 py-3">
                <p className="text-[10px] text-ink-400 uppercase tracking-wide">AI Confidence</p>
                <p className="font-bold text-ink-800 mt-0.5 text-sm">{wanderingAlert.confidence}%</p>
              </div>
              <div className="rounded-xl bg-white/70 px-3 py-3">
                <p className="text-[10px] text-ink-400 uppercase tracking-wide">Duration Away</p>
                <p className="font-bold text-ink-800 mt-0.5 text-sm">{wanderingAlert.durationMinutes} minutes</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/emergency")}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 rounded-xl bg-danger text-white font-bold py-2.5 text-sm shadow-glow-danger hover:bg-danger-dark transition-colors"
              >
                <PhoneCall className="h-4 w-4" />
                Emergency
              </button>
              <button
                onClick={() => navigate("/location")}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 rounded-xl bg-ink-800 text-white font-bold py-2.5 text-sm hover:bg-ink-900 transition-colors"
              >
                <MapPinned className="h-4 w-4" />
                View Map
              </button>
              <button
                type="button"
                onClick={callPatient}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 rounded-xl bg-brand-500 text-white font-bold py-2.5 text-sm hover:bg-brand-600 transition-colors"
              >
                <PhoneCall className="h-4 w-4" />
                Call Patient
              </button>
              <button
                type="button"
                onClick={notifyCaregiverOfAlert}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 rounded-xl bg-white text-ink-600 font-bold py-2.5 text-sm border border-ink-200 hover:bg-ink-50 transition-colors"
              >
                <PhoneOutgoing className="h-4 w-4" />
                Notify Caregiver
              </button>
            </div>

            <button
              onClick={dismissWandering}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-white text-ink-600 font-bold py-3 text-sm border border-ink-200 hover:bg-ink-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Dismiss Alert
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
