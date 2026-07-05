import { cn } from "@/lib/utils";

export type BadgeTone = "brand" | "mint" | "amber" | "danger" | "neutral";

const toneStyles: Record<BadgeTone, string> = {
  brand: "bg-brand-500/10 text-brand-700 ring-1 ring-brand-500/20",
  mint: "bg-mint-500/10 text-mint-700 ring-1 ring-mint-500/25",
  amber: "bg-amber-glow/10 text-amber-700 ring-1 ring-amber-glow/25",
  danger: "bg-danger/10 text-danger-dark ring-1 ring-danger/25",
  neutral: "bg-ink-100 text-ink-500 ring-1 ring-ink-200",
};

export function StatusBadge({
  children,
  tone = "neutral",
  dot = true,
  pulse = false,
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}) {
  const dotColor: Record<BadgeTone, string> = {
    brand: "bg-brand-500",
    mint: "bg-mint-500",
    amber: "bg-amber-glow",
    danger: "bg-danger",
    neutral: "bg-ink-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        toneStyles[tone],
        className
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[tone], pulse && "animate-pulse-slow")} />
      )}
      {children}
    </span>
  );
}

export function statusToTone(status: string): BadgeTone {
  switch (status) {
    case "Safe at Home":
    case "Connected":
    case "Inside Home":
    case "Resolved":
    case "LOW RISK":
    case "Walking":
    case "Standing":
      return "mint";
    case "Walking Detected":
    case "Sleeping":
    case "Sitting":
      return "brand";
    case "Weak Signal":
    case "Near Exit":
    case "MODERATE RISK":
    case "Medium":
    case "Active":
      return "amber";
    case "Emergency":
    case "Disconnected":
    case "Outside Home":
    case "HIGH RISK":
    case "High":
    case "Fall Detected":
      return "danger";
    default:
      return "neutral";
  }
}
