import { CalendarClock, User } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { usePatientData } from "@/context/PatientDataContext";
import { formatTime } from "@/lib/utils";

export function PatientStatusCard() {
  const { patient, status } = usePatientData();

  return (
    <GlassCard className="p-6" delay={0}>
      <CardHeader icon={<User className="h-5 w-5" />} title="Patient Status" subtitle="Identity & current state" />

      <div className="flex items-center gap-4 mb-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-mint-400 text-xl font-bold text-white shadow-glow-brand">
          {patient.avatarInitials}
        </div>
        <div>
          <p className="font-display font-bold text-lg text-ink-900 leading-tight">{patient.name}</p>
          <p className="text-sm text-ink-400">{patient.age} years old</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl bg-ink-50 px-4 py-3">
          <p className="text-[11px] font-medium text-ink-400 uppercase tracking-wide">Alzheimer's Stage</p>
          <p className="text-sm font-bold text-ink-800 mt-1">{patient.stage}</p>
        </div>
        <div className="rounded-2xl bg-ink-50 px-4 py-3">
          <p className="text-[11px] font-medium text-ink-400 uppercase tracking-wide">Current Status</p>
          <div className="mt-1.5">
            <StatusBadge tone={statusToTone(status)} pulse={status === "Emergency"}>
              {status}
            </StatusBadge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-ink-400 pt-3 border-t border-ink-100">
        <CalendarClock className="h-3.5 w-3.5" />
        Last updated {formatTime(patient.lastUpdated)}
      </div>
    </GlassCard>
  );
}
