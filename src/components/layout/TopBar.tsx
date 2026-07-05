import { useEffect, useState } from "react";
import { Bell, Menu, Wifi, WifiOff } from "lucide-react";
import { usePatientData } from "@/context/PatientDataContext";
import { formatClock } from "@/lib/utils";
import { NotificationPanel } from "./NotificationPanel";

export function TopBar({ title, subtitle, onMenuClick }: { title: string; subtitle?: string; onMenuClick?: () => void }) {
  const { patient, wifiStatus, alerts } = usePatientData();
  const [clock, setClock] = useState(new Date());
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const activeAlerts = alerts.filter((a) => a.status === "Active").length;
  const badgeCount = activeAlerts;

  return (
    <div className="sticky top-0 z-30 glass-panel border-b border-ink-100/60 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 border border-ink-100 text-ink-600 shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-xl sm:text-2xl text-ink-900 truncate">{title}</h1>
            {subtitle && <p className="text-sm text-ink-400 truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white/70 border border-ink-100 px-3 py-2 text-xs font-semibold text-ink-500">
            {wifiStatus === "Disconnected" ? (
              <WifiOff className="h-4 w-4 text-danger" />
            ) : (
              <Wifi className={wifiStatus === "Connected" ? "h-4 w-4 text-mint-500" : "h-4 w-4 text-amber-glow"} />
            )}
            {formatClock(clock)}
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Open notifications"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 border border-ink-100 text-ink-500 hover:text-brand-600 transition-colors"
            >
              <Bell className="h-[18px] w-[18px]" />
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white ring-2 ring-white">
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              )}
            </button>
            <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-white/70 border border-ink-100 pl-1.5 pr-3 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-mint-400 text-xs font-bold text-white">
              {patient.avatarInitials}
            </div>
            <div className="hidden md:block leading-tight">
              <p className="text-xs font-bold text-ink-800">{patient.name}</p>
              <p className="text-[11px] text-ink-400">Caregiver View</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
