import { Wifi } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { SignalStrengthBar } from "@/components/ui/SignalBars";
import { StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { usePatientData } from "@/context/PatientDataContext";

export function WifiStatusCard() {
  const { rssi, wifiStatus } = usePatientData();

  return (
    <GlassCard className="p-6">
      <CardHeader icon={<Wifi className="h-5 w-5" />} title="Wi-Fi Status" subtitle="Signal used for RSSI localization" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] text-ink-400 uppercase tracking-wide font-medium">Current RSSI</p>
          <p className="font-display font-extrabold text-3xl text-ink-900 mt-0.5 tabular-nums">{rssi} dBm</p>
        </div>
        <StatusBadge tone={statusToTone(wifiStatus)}>{wifiStatus}</StatusBadge>
      </div>

      <p className="text-xs font-semibold text-ink-500 mb-1.5">Signal Strength</p>
      <SignalStrengthBar rssi={rssi} />
    </GlassCard>
  );
}
