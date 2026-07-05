import { Activity, MapPin, Radio, Route, X } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { usePatientData } from "@/context/PatientDataContext";
import { formatTime } from "@/lib/utils";

export function LiveLocationPreview() {
  const {
    patientPosition,
    room,
    isLocationMoving,
    locationHeading,
    roomHistory,
    motion: motionState,
    rssi,
    patient,
    wanderingAlert,
    dismissWandering,
  } = usePatientData();

  return (
    <GlassCard className="p-6">
      <CardHeader
        icon={<Route className="h-5 w-5" />}
        title="Live Location Preview"
        subtitle="Real-time Wi-Fi RSSI tracking feed"
        action={
          <span className="flex items-center gap-1.5 rounded-full bg-mint-500/10 px-2.5 py-1 text-[11px] font-bold text-mint-700">
            <span className="h-1.5 w-1.5 rounded-full bg-mint-500 animate-pulse-slow" />
            LIVE
          </span>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Metric icon={<MapPin className="h-4 w-4" />} label="Current Room" value={room} highlight />
        <Metric
          icon={<Activity className="h-4 w-4" />}
          label="Motion"
          value={isLocationMoving ? motionState : "Stationary"}
        />
        <Metric
          icon={<Radio className="h-4 w-4" />}
          label="Coordinates"
          value={`${patientPosition.x.toFixed(1)}%, ${patientPosition.y.toFixed(1)}%`}
        />
        <Metric icon={<Radio className="h-4 w-4" />} label="RSSI" value={`${rssi} dBm`} />
      </div>

      {locationHeading && isLocationMoving && (
        <div
          className={`rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 ${
            wanderingAlert
              ? "bg-danger/10 border border-danger/30"
              : "bg-brand-500/8 border border-brand-500/15"
          }`}
        >
          <Activity
            className={`h-5 w-5 animate-pulse ${wanderingAlert ? "text-danger" : "text-brand-600"}`}
          />
          <div className="flex-1 min-w-0">
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${
                wanderingAlert ? "text-danger" : "text-brand-600"
              }`}
            >
              {wanderingAlert ? "Wandering alert active" : "In transit"}
            </p>
            <p className="text-sm font-bold text-ink-800">{locationHeading}</p>
          </div>
          {wanderingAlert && (
            <button
              onClick={dismissWandering}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-white text-ink-600 font-bold px-3 py-2 text-xs border border-ink-200 hover:bg-ink-50 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Dismiss
            </button>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-ink-50 px-4 py-3">
        <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wide mb-2">Room history</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {roomHistory.length === 0 ? (
            <span className="text-xs text-ink-400">Building path history…</span>
          ) : (
            roomHistory.map((r, i) => (
              <span key={`${r}-${i}`} className="inline-flex items-center gap-1">
                {i > 0 && <span className="text-ink-300 text-xs">→</span>}
                <StatusBadge
                  tone={i === roomHistory.length - 1 ? statusToTone(r) : "neutral"}
                  dot={i === roomHistory.length - 1}
                  className="text-[11px]"
                >
                  {r}
                </StatusBadge>
              </span>
            ))
          )}
        </div>
      </div>

      <p className="text-[11px] text-ink-400 mt-3 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse-slow" />
        Last fix {formatTime(patient.lastUpdated)} · updating every ~80ms
      </p>
    </GlassCard>
  );
}

function Metric({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-ink-50 px-3 py-3">
      <div className="flex items-center gap-1.5 text-ink-400 mb-1">{icon}<span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span></div>
      <p className={`text-sm font-bold truncate ${highlight ? "text-brand-600" : "text-ink-800"}`}>{value}</p>
    </div>
  );
}
