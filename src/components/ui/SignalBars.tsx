import { cn } from "@/lib/utils";

export function SignalBars({ rssi, className }: { rssi: number; className?: string }) {
  // rssi typically -30 (excellent) to -90 (very poor)
  const strength = Math.round(((rssi + 90) / 60) * 4);
  const bars = [1, 2, 3, 4];
  return (
    <div className={cn("flex items-end gap-1", className)}>
      {bars.map((bar) => (
        <span
          key={bar}
          style={{ height: `${bar * 5 + 6}px` }}
          className={cn(
            "w-1.5 rounded-full transition-colors",
            bar <= strength ? "bg-mint-500" : "bg-ink-200"
          )}
        />
      ))}
    </div>
  );
}

export function SignalStrengthBar({ rssi }: { rssi: number }) {
  const pct = Math.round(((rssi + 90) / 60) * 100);
  const clamped = Math.min(100, Math.max(4, pct));
  const color = clamped > 65 ? "bg-mint-500" : clamped > 35 ? "bg-amber-glow" : "bg-danger";
  return (
    <div className="h-2.5 w-full rounded-full bg-ink-100 overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
