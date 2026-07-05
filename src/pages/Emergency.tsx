import { motion } from "framer-motion";
import {
  AlertTriangle,
  HeartPulse,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  ShieldCheck,
  Siren,
  Clock,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";
import { formatClock } from "@/lib/utils";

export default function Emergency() {
  const { patient, room, heartRate, fallDetected, fallEvent, endEmergency } = usePatientData();

  const actions = [
    { label: "Call Patient", icon: Phone, tone: "bg-brand-500 hover:bg-brand-600" },
    { label: "Call Caregiver", icon: PhoneCall, tone: "bg-mint-500 hover:bg-mint-600" },
    { label: "Call Emergency Services", icon: Siren, tone: "bg-danger hover:bg-danger-dark" },
    {
      label: "Open Google Maps",
      icon: Navigation,
      tone: "bg-ink-800 hover:bg-ink-900",
      onClick: () =>
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(room === "Outside Home" ? "Patient last known location" : "Home")}`,
          "_blank"
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {fallDetected ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-r from-danger to-danger-dark text-white p-6 sm:p-8 shadow-glow-danger relative overflow-hidden"
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
                <AlertTriangle className="h-8 w-8" />
              </motion.div>
              <div>
                <p className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">Active Emergency</p>
                <p className="text-white/80 text-sm mt-1">Fall detected — immediate response required</p>
              </div>
            </div>
            <button
              onClick={endEmergency}
              className="rounded-2xl bg-white text-danger-dark font-bold px-5 py-3 text-sm hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              Mark as Resolved
            </button>
          </div>
        </motion.div>
      ) : (
        <GlassCard className="p-6 sm:p-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-500/15 text-mint-600">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <p className="font-display font-extrabold text-xl text-ink-900">No Active Emergency</p>
            <p className="text-sm text-ink-400">All systems normal. This panel activates automatically when a fall or critical event is detected.</p>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-5">Current Emergency Snapshot</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <InfoTile icon={<ShieldCheck className="h-5 w-5" />} label="Patient Name" value={patient.name} />
          <InfoTile icon={<MapPin className="h-5 w-5" />} label="Last Seen Location" value={room} />
          <InfoTile icon={<HeartPulse className="h-5 w-5" />} label="Current Heart Rate" value={`${heartRate} BPM`} />
          <InfoTile icon={<Clock className="h-5 w-5" />} label="Time" value={fallEvent?.time ?? formatClock(new Date())} />
        </div>

        {fallDetected && (
          <div className="rounded-2xl bg-danger/10 border border-danger/25 px-5 py-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-danger-dark shrink-0" />
            <p className="text-sm font-bold text-danger-dark">Fall Severity: {fallEvent?.severity ?? "High"}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map(({ label, icon: Icon, tone, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={`flex items-center justify-center gap-2 rounded-2xl text-white font-bold py-4 text-sm transition-colors shadow-md ${tone}`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
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
