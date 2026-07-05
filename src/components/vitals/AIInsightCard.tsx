import { BrainCircuit, CheckCircle2 } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";

export function AIInsightCard() {
  const { heartRate } = usePatientData();
  const stable = heartRate >= 60 && heartRate <= 100;

  return (
    <GlassCard className="p-6">
      <CardHeader icon={<BrainCircuit className="h-5 w-5" />} title="AI Insights" subtitle="Automated vitals interpretation" />

      <div
        className={`flex items-start gap-3 rounded-2xl px-4 py-4 ${
          stable ? "bg-mint-500/8 border border-mint-500/20" : "bg-amber-glow/10 border border-amber-glow/25"
        }`}
      >
        <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${stable ? "text-mint-600" : "text-amber-600"}`} />
        <div>
          <p className={`text-sm font-bold ${stable ? "text-mint-700" : "text-amber-700"}`}>
            {stable ? "Heart rate remained stable." : "Elevated resting heart rate detected."}
          </p>
          <p className="text-xs text-ink-600 mt-1">
            {stable
              ? "No abnormalities detected across the last 24 hours of monitoring."
              : "Recommend continued observation. Consider notifying the primary care provider if the trend persists."}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
