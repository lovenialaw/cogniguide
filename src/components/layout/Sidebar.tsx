import { NavLink } from "react-router-dom";
import {
  Activity,
  AlertOctagon,
  Bell,
  BrainCircuit,
  HeartPulse,
  LayoutDashboard,
  MapPin,
  RadioTower,
  Settings,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePatientData } from "@/context/PatientDataContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/live", label: "Live Monitoring", icon: Activity },
  { to: "/location", label: "Location", icon: MapPin },
  { to: "/wifi-nodes", label: "WiFi Node Tracking", icon: RadioTower, isNew: true },
  { to: "/analytics", label: "AI Analytics", icon: BrainCircuit },
  { to: "/vitals", label: "Vital Signs", icon: HeartPulse },
  { to: "/alerts", label: "Alert History", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { fallDetected, wanderingAlert } = usePatientData();
  const hasAlert = fallDetected || !!wanderingAlert;

  return (
    <div className="flex h-full flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-mint-500 shadow-glow-brand">
          <Stethoscope className="h-5 w-5 text-white" strokeWidth={2.2} />
        </div>
        <div>
          <p className="font-display font-extrabold text-ink-900 text-lg leading-none tracking-tight">
            COGNI<span className="text-brand-500">GUIDE</span>
          </p>
          <p className="text-[11px] text-ink-400 mt-1 tracking-wide">Caregiver Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, isNew }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow-brand"
                  : "text-ink-500 hover:bg-brand-500/8 hover:text-brand-700"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2.1} />
                <span className="flex-1 truncate">{label}</span>
                {isNew && (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide",
                      isActive ? "bg-white/25 text-white" : "bg-mint-500 text-white"
                    )}
                  >
                    New
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/emergency"
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition-all border",
            isActive || hasAlert
              ? "bg-danger text-white border-danger shadow-glow-danger animate-pulse-slow"
              : "bg-danger/8 text-danger-dark border-danger/20 hover:bg-danger/15"
          )
        }
      >
        {hasAlert ? <AlertOctagon className="h-[18px] w-[18px]" /> : <ShieldAlert className="h-[18px] w-[18px]" />}
        Emergency
      </NavLink>
    </div>
  );
}
