import { useMemo, useState } from "react";
import { AlertTriangle, DoorOpen, Download, HeartPulse, Search, SlidersHorizontal, ZapOff } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { usePatientData } from "@/context/PatientDataContext";
import { cn } from "@/lib/utils";
import type { AlertRecord } from "@/types";

const EVENT_ICON: Record<AlertRecord["event"], typeof AlertTriangle> = {
  Fall: AlertTriangle,
  "Left Home": DoorOpen,
  Wandering: DoorOpen,
  "Low Battery": ZapOff,
  "Irregular Heart Rate": HeartPulse,
};

const SEVERITY_TONE: Record<AlertRecord["severity"], "danger" | "amber" | "brand"> = {
  High: "danger",
  Medium: "amber",
  Low: "brand",
};

export default function AlertHistory() {
  const { alerts, resolveAlert } = usePatientData();
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"All" | AlertRecord["severity"]>("All");

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const matchesQuery = a.event.toLowerCase().includes(query.toLowerCase()) || a.time.toLowerCase().includes(query.toLowerCase());
      const matchesSeverity = severityFilter === "All" || a.severity === severityFilter;
      return matchesQuery && matchesSeverity;
    });
  }, [alerts, query, severityFilter]);

  return (
    <GlassCard className="p-6">
      <CardHeader icon={<AlertTriangle className="h-5 w-5" />} title="Alert History" subtitle="Complete timeline of triggered events" />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 rounded-2xl bg-ink-50 px-4 py-2.5">
          <Search className="h-4 w-4 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events or time..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-300 text-ink-700"
          />
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-ink-50 px-3 py-1.5">
          <SlidersHorizontal className="h-4 w-4 text-ink-400" />
          {(["All", "High", "Medium", "Low"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                severityFilter === s ? "bg-white text-brand-600 shadow-sm" : "text-ink-400"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 text-white text-sm font-semibold px-4 py-2.5 hover:bg-brand-600 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-100">
              <th className="px-2 py-3 font-semibold">Time</th>
              <th className="px-2 py-3 font-semibold">Event</th>
              <th className="px-2 py-3 font-semibold">Severity</th>
              <th className="px-2 py-3 font-semibold">Status</th>
              <th className="px-2 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((alert) => {
              const Icon = EVENT_ICON[alert.event];
              return (
                <tr key={alert.id} className="border-b border-ink-50 hover:bg-ink-50/60 transition-colors">
                  <td className="px-2 py-3 font-semibold text-ink-700 whitespace-nowrap">{alert.time}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2 text-ink-700 font-medium">
                      <Icon className="h-4 w-4 text-ink-400" />
                      {alert.event}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <StatusBadge tone={SEVERITY_TONE[alert.severity]}>{alert.severity}</StatusBadge>
                  </td>
                  <td className="px-2 py-3">
                    <StatusBadge tone={statusToTone(alert.status)}>{alert.status}</StatusBadge>
                  </td>
                  <td className="px-2 py-3 text-right">
                    {alert.status === "Active" && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-ink-400 text-sm">
                  No alerts match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
