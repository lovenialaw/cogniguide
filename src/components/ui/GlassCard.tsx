import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: "none" | "brand" | "mint" | "danger";
  delay?: number;
}

const glowMap: Record<string, string> = {
  none: "shadow-glass",
  brand: "shadow-glow-brand",
  mint: "shadow-glow-mint",
  danger: "shadow-glow-danger",
};

export function GlassCard({ children, className, glow = "none", delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className={cn("glass-card rounded-3xl", glowMap[glow], className)}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-display font-bold text-ink-900 text-[15px] leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
