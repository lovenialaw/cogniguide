import { useState } from "react";
import { Battery, Bell, Fingerprint, Shield, User, Watch } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors shrink-0",
        checked ? "bg-brand-500" : "bg-ink-200"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function SettingRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-ink-50 last:border-0">
      <div>
        <p className="text-sm font-semibold text-ink-800">{label}</p>
        <p className="text-xs text-ink-400 mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function Settings() {
  const { patient } = usePatientData();
  const [notifications, setNotifications] = useState({
    fall: true,
    wandering: true,
    heartRate: true,
    lowBattery: false,
    dailySummary: true,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <GlassCard className="p-6">
        <CardHeader icon={<User className="h-5 w-5" />} title="Patient Profile" subtitle="Basic patient information" />
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-mint-400 text-xl font-bold text-white">
            {patient.avatarInitials}
          </div>
          <div>
            <p className="font-display font-bold text-lg text-ink-900">{patient.name}</p>
            <p className="text-sm text-ink-400">{patient.age} years old · {patient.stage}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-ink-50 px-4 py-3">
            <p className="text-[11px] text-ink-400 uppercase tracking-wide">Primary Caregiver</p>
            <p className="text-sm font-bold text-ink-800 mt-1">Michael Whitfield</p>
          </div>
          <div className="rounded-2xl bg-ink-50 px-4 py-3">
            <p className="text-[11px] text-ink-400 uppercase tracking-wide">Emergency Contact</p>
            <p className="text-sm font-bold text-ink-800 mt-1">+1 (555) 019-2837</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader icon={<Watch className="h-5 w-5" />} title="Device Status" subtitle="COGNIGUIDE smartwatch" />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-ink-50 px-4 py-3 flex items-center gap-3">
            <Battery className="h-5 w-5 text-mint-600" />
            <div>
              <p className="text-[11px] text-ink-400 uppercase tracking-wide">Battery</p>
              <p className="text-sm font-bold text-ink-800">82%</p>
            </div>
          </div>
          <div className="rounded-2xl bg-ink-50 px-4 py-3 flex items-center gap-3">
            <Shield className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-[11px] text-ink-400 uppercase tracking-wide">Firmware</p>
              <p className="text-sm font-bold text-ink-800">v3.2.1</p>
            </div>
          </div>
          <div className="rounded-2xl bg-ink-50 px-4 py-3 flex items-center gap-3">
            <Fingerprint className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-[11px] text-ink-400 uppercase tracking-wide">Device ID</p>
              <p className="text-sm font-bold text-ink-800">CG-04821</p>
            </div>
          </div>
          <div className="rounded-2xl bg-ink-50 px-4 py-3 flex items-center gap-3">
            <Bell className="h-5 w-5 text-danger" />
            <div>
              <p className="text-[11px] text-ink-400 uppercase tracking-wide">Sync Status</p>
              <p className="text-sm font-bold text-ink-800">Live</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 lg:col-span-2">
        <CardHeader icon={<Bell className="h-5 w-5" />} title="Notification Preferences" subtitle="Choose what triggers a caregiver alert" />
        <SettingRow
          label="Fall Detection Alerts"
          description="Receive an instant notification when a fall is detected"
          checked={notifications.fall}
          onChange={(v) => setNotifications((s) => ({ ...s, fall: v }))}
        />
        <SettingRow
          label="Wandering Alerts"
          description="Notify when patient leaves the designated safe zone"
          checked={notifications.wandering}
          onChange={(v) => setNotifications((s) => ({ ...s, wandering: v }))}
        />
        <SettingRow
          label="Heart Rate Anomalies"
          description="Alert on irregular or out-of-range heart rate readings"
          checked={notifications.heartRate}
          onChange={(v) => setNotifications((s) => ({ ...s, heartRate: v }))}
        />
        <SettingRow
          label="Low Battery Warning"
          description="Notify when the smartwatch battery drops below 20%"
          checked={notifications.lowBattery}
          onChange={(v) => setNotifications((s) => ({ ...s, lowBattery: v }))}
        />
        <SettingRow
          label="Daily Summary Report"
          description="Receive a daily digest of activity, vitals and alerts"
          checked={notifications.dailySummary}
          onChange={(v) => setNotifications((s) => ({ ...s, dailySummary: v }))}
        />
      </GlassCard>
    </div>
  );
}
