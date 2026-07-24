import { motion } from "framer-motion";
import {
  AlertTriangle,
  BrainCircuit,
  HeartPulse,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  ShieldCheck,
  Siren,
  Clock,
  Waypoints,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";
import { useCareActions } from "@/hooks/useCareActions";
import { formatClock } from "@/lib/utils";

export default function Emergency() {
  const {
    patient,
    room,
    heartRate,
    geofence,
    fallDetected,
    fallEvent,
    wanderingAlert,
    dualVerified,
    fallVerifyStatus,
    wanderVerifyStatus,
    endEmergency,
  } = usePatientData();
  const { callPatient, callCaregiver, callEmergencyServices, openMaps } = useCareActions();

  const watchFlagged = fallDetected || !!wanderingAlert;
  const hasActiveEmergency = dualVerified;
  const awaitingSensors = watchFlagged && !dualVerified;

  const actions = [
    { label: "Call Patient", icon: Phone, tone: "bg-brand-500 hover:bg-brand-600", onClick: callPatient },
    { label: "Call Caregiver", icon: PhoneCall, tone: "bg-mint-500 hover:bg-mint-600", onClick: callCaregiver },
    {
      label: "Call Emergency Services",
      icon: Siren,
      tone: "bg-danger hover:bg-danger-dark",
      onClick: callEmergencyServices,
    },
    { label: "Open Google Maps", icon: Navigation, tone: "bg-ink-800 hover:bg-ink-900", onClick: openMaps },
  ];

  const eventTime = fallDetected ? fallEvent?.time : wanderingAlert?.time;

  return (
    <div className="flex flex-col gap-5">
      {hasActiveEmergency ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl text-white p-6 sm:p-8 shadow-glow-danger relative overflow-hidden ${
            fallVerifyStatus === "confirmed"
              ? "bg-gradient-to-r from-danger to-danger-dark"
              : "bg-gradient-to-r from-amber-glow to-amber-600"
          }`}
        >
          <motion.div
            animate={{ opacity: [0.4, 0.15, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="absolute inset-0 bg-white/10"
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 0.85 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur"
              >
                {fallVerifyStatus === "confirmed" ? (
                  <AlertTriangle className="h-8 w-8" />
                ) : (
                  <Waypoints className="h-8 w-8" />
                )}
              </motion.div>
              <div>
                <p className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
                  Active Emergency
                </p>
                <p className="text-white/80 text-sm mt-1">
                  {fallVerifyStatus === "confirmed"
                    ? `${patient.name} fell in ${room}`
                    : `${patient.name} wandered at ${room}`}
                </p>
              </div>
            </div>
            <button
              onClick={endEmergency}
              className="rounded-2xl bg-white text-ink-900 font-bold px-5 py-3.5 text-sm hover:bg-white/90 transition-colors whitespace-nowrap w-full sm:w-auto"
            >
              Dismiss Alert
            </button>
          </div>
        </motion.div>
      ) : awaitingSensors ? (
        <GlassCard className="p-6 sm:p-8 flex items-center gap-4 border border-amber-glow/40 bg-amber-glow/8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-glow/20 text-amber-700">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="font-display font-extrabold text-xl text-ink-900">
              Awaiting home sensor confirmation
            </p>
            <p className="text-sm text-ink-500 mt-1">
              {fallDetected
                ? "Smartwatch flagged a fall. No caregiver alert until ESP32 nodes confirm stillness."
                : "Watch flagged a possible exit. No caregiver alert until ESP32 RSSI confirms."}{" "}
              Status: {fallDetected ? fallVerifyStatus : wanderVerifyStatus}.
            </p>
          </div>
          <button
            onClick={endEmergency}
            className="rounded-2xl border border-ink-200 bg-white text-ink-800 font-bold px-4 py-2.5 text-sm hover:bg-ink-50 transition-colors whitespace-nowrap"
          >
            Dismiss
          </button>
        </GlassCard>
      ) : (
        <GlassCard className="p-6 sm:p-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-500/15 text-mint-600">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <p className="font-display font-extrabold text-xl text-ink-900">No Active Emergency</p>
            <p className="text-sm text-ink-400">
              Caregiver alerts require dual verification — smartwatch and home ESP32 nodes must both
              agree before an emergency is sent.
            </p>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-5">
          Current Emergency Snapshot
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <InfoTile icon={<ShieldCheck className="h-5 w-5" />} label="Patient Name" value={patient.name} />
          <InfoTile icon={<MapPin className="h-5 w-5" />} label="Last Seen Location" value={room} />
          <InfoTile icon={<HeartPulse className="h-5 w-5" />} label="Current Heart Rate" value={`${heartRate} BPM`} />
          <InfoTile icon={<Clock className="h-5 w-5" />} label="Event Time" value={eventTime ?? formatClock(new Date())} />
        </div>

        {fallDetected && (
          <div className="rounded-2xl bg-danger/10 border border-danger/25 px-5 py-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-danger-dark shrink-0" />
            <p className="text-sm font-bold text-danger-dark">
              Fall Severity: {fallEvent?.severity ?? "High"}
            </p>
          </div>
        )}

        {wanderingAlert && (
          <div className="rounded-2xl bg-amber-glow/10 border border-amber-glow/30 px-5 py-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Waypoints className="h-5 w-5 text-amber-700 shrink-0" />
              <p className="text-sm font-bold text-amber-800">Wandering Alert Active</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SnapshotDetail icon={<BrainCircuit className="h-4 w-4" />} label="AI Confidence" value={`${wanderingAlert.confidence}%`} />
              <SnapshotDetail icon={<Clock className="h-4 w-4" />} label="Duration Away" value={`${wanderingAlert.durationMinutes} min`} />
              <SnapshotDetail icon={<MapPin className="h-4 w-4" />} label="Geofence" value={geofence} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map(({ label, icon: Icon, tone, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={`flex items-center justify-center gap-2.5 rounded-2xl text-white font-bold min-h-[52px] px-4 py-3.5 text-sm transition-colors shadow-md ${tone}`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="text-center leading-snug">{label}</span>
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ink-50 px-4 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-600 mb-3">{icon}</div>
      <p className="text-[11px] text-ink-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-sm font-bold text-ink-800 mt-1 truncate">{value}</p>
    </div>
  );
}

function SnapshotDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/70 px-3 py-3">
      <div className="flex items-center gap-1.5 text-amber-700 mb-1">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-bold text-ink-800">{value}</p>
    </div>
  );
}
