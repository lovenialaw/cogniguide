import { Home, MapPin, Wifi, WifiOff } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { usePatientData } from "@/context/PatientDataContext";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ROOM_ORDER = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Outside Home"];

export function LocationCard() {
  const { room, wifiStatus, patient } = usePatientData();

  return (
    <GlassCard className="p-6" delay={0.05}>
      <CardHeader icon={<MapPin className="h-5 w-5" />} title="Current Location" subtitle="Wi-Fi based indoor positioning" />

      <div className="flex items-center justify-between rounded-2xl bg-ink-50 px-4 py-3 mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
          {wifiStatus === "Disconnected" ? (
            <WifiOff className="h-4 w-4 text-danger" />
          ) : (
            <Wifi className="h-4 w-4 text-mint-500" />
          )}
          Home Wi-Fi
        </div>
        <StatusBadge tone={statusToTone(wifiStatus)}>{wifiStatus}</StatusBadge>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {ROOM_ORDER.map((r) => (
          <span
            key={r}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
              room === r
                ? "bg-brand-500 text-white shadow-glow-brand scale-105"
                : "bg-ink-50 text-ink-400"
            )}
          >
            {r === "Outside Home" && <Home className="h-3 w-3" />}
            {r}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 pt-4">
        <div>
          <p className="text-[11px] font-medium text-ink-400 uppercase tracking-wide">Last Seen</p>
          <p className="text-sm font-bold text-ink-800 mt-1">{formatTime(patient.lastUpdated)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium text-ink-400 uppercase tracking-wide">Room</p>
          <p className="text-sm font-bold text-brand-600 mt-1">{room}</p>
        </div>
      </div>
    </GlassCard>
  );
}
