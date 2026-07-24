import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bell, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { alertRouteForEvent } from "@/lib/contacts";
import { usePatientData } from "@/context/PatientDataContext";
import { cn } from "@/lib/utils";
import type { AlertRecord } from "@/types";

const SEVERITY_TONE: Record<AlertRecord["severity"], string> = {
  High: "text-danger bg-danger/10",
  Medium: "text-amber-700 bg-amber-glow/10",
  Low: "text-brand-600 bg-brand-500/10",
};

export function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { alerts, fallDetected, wanderingAlert, dualVerified, fallVerifyStatus, wanderVerifyStatus } =
    usePatientData();
  const navigate = useNavigate();

  const activeAlerts = alerts.filter((a) => a.status === "Active").slice(0, 8);
  const watchFlagged = fallDetected || !!wanderingAlert;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const openAlert = (alert: AlertRecord) => {
    navigate(alertRouteForEvent(alert.event));
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,360px)] rounded-2xl bg-white border border-ink-100 shadow-xl overflow-hidden z-50"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-50 bg-ink-50/50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-brand-600" />
              <p className="text-sm font-bold text-ink-900">Notifications</p>
            </div>
            {activeAlerts.length > 0 && (
              <span className="text-[11px] font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                {activeAlerts.length} active
              </span>
            )}
          </div>

          {watchFlagged && (
            <div className="px-3 pt-3">
              <button
                onClick={() => {
                  navigate("/emergency");
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                  dualVerified
                    ? "bg-danger/10 border-danger/20 hover:bg-danger/15"
                    : "bg-amber-glow/10 border-amber-glow/25 hover:bg-amber-glow/15"
                )}
              >
                <AlertTriangle
                  className={cn("h-5 w-5 shrink-0", dualVerified ? "text-danger" : "text-amber-700")}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-bold",
                      dualVerified ? "text-danger-dark" : "text-amber-800"
                    )}
                  >
                    {dualVerified
                      ? fallVerifyStatus === "confirmed"
                        ? "Dual-verified fall — caregiver alerted"
                        : "Dual-verified wandering — caregiver alerted"
                      : fallDetected
                        ? "Fall pending home sensor confirm"
                        : "Wandering pending home sensor confirm"}
                  </p>
                  <p className="text-xs text-ink-500">
                    {dualVerified
                      ? "Tap to open Emergency center"
                      : `Awaiting ESP32 agreement (${fallDetected ? fallVerifyStatus : wanderVerifyStatus})`}
                  </p>
                </div>
                <ChevronRight
                  className={cn("h-4 w-4 shrink-0", dualVerified ? "text-danger" : "text-amber-700")}
                />
              </button>
            </div>
          )}

          <div className="max-h-[320px] overflow-y-auto p-2">
            {activeAlerts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-semibold text-ink-600">No active alerts</p>
                <p className="text-xs text-ink-400 mt-1">You&apos;re all caught up.</p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => openAlert(alert)}
                  className="w-full flex items-start gap-3 rounded-xl px-3 py-3 text-left hover:bg-ink-50 transition-colors"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                      SEVERITY_TONE[alert.severity]
                    )}
                  >
                    !
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink-800 truncate">{alert.event}</p>
                    <p className="text-xs text-ink-400 mt-0.5">
                      {alert.time} · {alert.severity} severity
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-300 shrink-0 mt-1" />
                </button>
              ))
            )}
          </div>

          <div className="border-t border-ink-50 p-2">
            <button
              onClick={() => {
                navigate("/alerts");
                onClose();
              }}
              className="w-full rounded-xl py-2.5 text-sm font-bold text-brand-600 hover:bg-brand-500/8 transition-colors"
            >
              View all alert history
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
