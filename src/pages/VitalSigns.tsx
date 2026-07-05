import { Droplets, HeartPulse, Thermometer, Waves } from "lucide-react";
import { VitalStatCard } from "@/components/vitals/VitalStatCard";
import { HeartRateHistoryChart } from "@/components/vitals/HeartRateHistoryChart";
import { AIInsightCard } from "@/components/vitals/AIInsightCard";
import { usePatientData } from "@/context/PatientDataContext";

export default function VitalSigns() {
  const { heartRate, spo2, temperature, stress } = usePatientData();

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <VitalStatCard
          icon={<HeartPulse className="h-5 w-5" />}
          label="Heart Rate"
          value={heartRate}
          unit="BPM"
          status={heartRate > 100 || heartRate < 55 ? "elevated" : "normal"}
          tone="bg-danger/10 text-danger"
          delay={0}
        />
        <VitalStatCard
          icon={<Droplets className="h-5 w-5" />}
          label="Blood Oxygen (SpO2)"
          value={spo2}
          unit="%"
          status={spo2 < 94 ? "watch" : "normal"}
          tone="bg-brand-500/10 text-brand-600"
          delay={0.05}
        />
        <VitalStatCard
          icon={<Thermometer className="h-5 w-5" />}
          label="Body Temperature"
          value={temperature}
          unit="°F"
          status={temperature > 99.5 ? "watch" : "normal"}
          tone="bg-amber-glow/10 text-amber-600"
          delay={0.1}
        />
        <VitalStatCard
          icon={<Waves className="h-5 w-5" />}
          label="Stress Level"
          value={stress}
          unit="/100"
          status={stress > 60 ? "watch" : "normal"}
          tone="bg-mint-500/10 text-mint-600"
          delay={0.15}
        />
      </div>

      <HeartRateHistoryChart />
      <AIInsightCard />
    </div>
  );
}
