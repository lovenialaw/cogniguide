import { motion } from "framer-motion";
import { DoorOpen, Home, ShieldAlert, X } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";
import type { GeofenceState } from "@/types";

const META: Record<GeofenceState, { icon: typeof Home; grad: string; text: string; desc: string }> = {
  "Inside Home": {
    icon: Home,
    grad: "from-mint-400 to-mint-600",
    text: "text-mint-700",
    desc: "Patient is within the safe home perimeter.",
  },
  "Near Exit": {
    icon: DoorOpen,
    grad: "from-amber-glow to-amber-600",
    text: "text-amber-700",
    desc: "Patient is approaching a doorway or exit zone.",
  },
  "Outside Home": {
    icon: ShieldAlert,
    grad: "from-danger to-danger-dark",
    text: "text-danger-dark",
    desc: "Patient has left the designated safe zone.",
  },
};

export function GeofenceStatusCard() {
  const { geofence, wanderingAlert, dismissWandering } = usePatientData();
  const meta = META[geofence];
  const Icon = meta.icon;

  return (
    <GlassCard className="p-6" glow={geofence === "Outside Home" ? "danger" : wanderingAlert ? "danger" : "none"}>
      <CardHeader icon={<ShieldAlert className="h-5 w-5" />} title="Geofence Status" subtitle="Virtual home perimeter" />

      <motion.div
        key={geofence}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-4 rounded-2xl bg-ink-50 px-4 py-4"
      >
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.grad} text-white`}>
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <p className={`font-display font-extrabold text-lg ${meta.text}`}>{geofence}</p>
          <p className="text-xs text-ink-400 mt-0.5">{meta.desc}</p>
        </div>
      </motion.div>

      {wanderingAlert && (
        <button
          onClick={dismissWandering}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-white text-ink-600 font-bold py-2.5 text-sm border border-ink-200 hover:bg-ink-50 transition-colors"
        >
          <X className="h-4 w-4" />
          Dismiss Alert
        </button>
      )}
    </GlassCard>
  );
}
