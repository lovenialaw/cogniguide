import { FallFrequencyChart } from "@/components/analytics/FallFrequencyChart";
import { TrendAnalysisChart } from "@/components/analytics/TrendAnalysisChart";
import { ActivityRecognitionPie } from "@/components/analytics/ActivityRecognitionPie";
import { AIConfidenceCard } from "@/components/analytics/AIConfidenceCard";

export default function AIAnalytics() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <FallFrequencyChart />
      <TrendAnalysisChart />
      <ActivityRecognitionPie />
      <AIConfidenceCard />
    </div>
  );
}
