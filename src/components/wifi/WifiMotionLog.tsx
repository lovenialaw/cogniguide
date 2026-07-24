import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarRange, Siren, Waves } from "lucide-react";
import {
  filterMotionEvents,
  type DateInterval,
  type NodeMotionEvent,
} from "@/lib/wifiNodes";
import { cn, formatClock } from "@/lib/utils";

const DATE_OPTIONS: { key: DateInterval; label: string }[] = [
  { key: "all", label: "Any date" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "custom", label: "Custom" },
];

function formatEventStamp(date: Date) {
  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} · ${formatClock(date)}`;
}

export function WifiMotionLog({
  events,
  onDismiss,
}: {
  events: NodeMotionEvent[];
  onDismiss: (id: string) => void;
}) {
  const [dateInterval, setDateInterval] = useState<DateInterval>("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const filtered = useMemo(
    () => filterMotionEvents(events, dateInterval, customFrom, customTo),
    [events, dateInterval, customFrom, customTo]
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="font-display font-bold text-ink-900">Motion log</p>
          <p className="text-xs text-ink-400 mt-0.5">Filter by date interval</p>
        </div>
        <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-bold text-ink-500">
          {filtered.length}/{events.length}
        </span>
      </div>

      <div className="mb-3 space-y-2.5">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-400 mb-1.5">
            <CalendarRange className="h-3 w-3" />
            Date interval
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setDateInterval(opt.key)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  dateInterval === opt.key
                    ? "bg-mint-500 text-white shadow-sm"
                    : "bg-ink-50 text-ink-500 hover:bg-ink-100"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {dateInterval === "custom" && (
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-ink-50 p-2.5">
            <label className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
              From
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink-100 bg-white px-2 py-1.5 text-xs font-semibold text-ink-700 outline-none focus:border-brand-300"
              />
            </label>
            <label className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
              To
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink-100 bg-white px-2 py-1.5 text-xs font-semibold text-ink-700 outline-none focus:border-brand-300"
              />
            </label>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-ink-50 px-4 py-8 text-center">
              <Waves className="h-6 w-6 text-ink-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-ink-500">No events in this interval</p>
              <p className="text-xs text-ink-400 mt-1">Try a wider date range</p>
            </div>
          ) : (
            filtered.map((evt) => {
              const strong = evt.state === "strong";
              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    "relative rounded-2xl border px-4 py-3",
                    strong ? "bg-danger/10 border-danger/30" : "bg-white/80 border-ink-100"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onDismiss(evt.id)}
                    className="absolute top-2.5 right-3 text-ink-300 hover:text-ink-500 text-sm font-bold"
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                  <div className="flex items-start gap-3 pr-4">
                    {strong ? (
                      <Siren className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                    ) : (
                      <Waves className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded",
                            strong ? "bg-danger/15 text-danger-dark" : "bg-amber-glow/15 text-amber-700"
                          )}
                        >
                          {evt.state}
                        </span>
                        <span className="text-[11px] font-bold text-ink-500">
                          {(evt.intensity * 28).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-ink-800 mt-1">{evt.message}</p>
                      <p className="text-[11px] text-ink-400 mt-0.5">
                        {evt.nodeId} · {formatEventStamp(evt.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
