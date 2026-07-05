import { motion } from "framer-motion";
import { BrainCircuit, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";
import type { RiskLevel } from "@/types";

const RISK_STYLES: Record<RiskLevel, { grad: string; text: string; ring: string; label: string }> = {
  "LOW RISK": {
    grad: "from-mint-400 to-mint-600",
    text: "text-mint-700",
    ring: "shadow-glow-mint",
    label: "Patient appears stable across all monitored signals.",
  },
  "MODERATE RISK": {
    grad: "from-amber-glow to-amber-600",
    text: "text-amber-700",
    ring: "shadow-glow-brand",
    label: "Some irregularities detected. Continued observation advised.",
  },
  "HIGH RISK": {
    grad: "from-danger to-danger-dark",
    text: "text-danger-dark",
    ring: "shadow-glow-danger",
    label: "Multiple risk indicators active. Immediate attention recommended.",
  },
};

export function AIHealthCard() {
  const { aiRisk } = usePatientData();
  const style = RISK_STYLES[aiRisk.level];

  return (
    <GlassCard className="p-6 flex flex-col justify-between h-full relative overflow-hidden" delay={0.2}>
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br opacity-10 blur-2xl from-brand-400 to-mint-400" />

      <div className="flex items-center gap-3 mb-6 relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-ink-900 text-[15px] leading-tight">AI Overall Status</h3>
          <p className="text-xs text-ink-400 mt-0.5">Composite model assessment</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-4 relative">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className={`flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${style.grad} ${style.ring}`}
        >
          <ShieldCheck className="h-12 w-12 text-white" strokeWidth={1.8} />
        </motion.div>

        <p className={`font-display font-extrabold text-2xl mt-5 tracking-tight ${style.text}`}>{aiRisk.level}</p>
        <p className="text-sm text-ink-400 text-center mt-2 max-w-[220px]">{style.label}</p>
      </div>

      <div className="mt-5 pt-4 border-t border-ink-100">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-500 mb-1.5">
          <span>AI Confidence</span>
          <span>{aiRisk.confidence}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-ink-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${aiRisk.confidence}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${style.grad}`}
          />
        </div>
      </div>
    </GlassCard>
  );
}
