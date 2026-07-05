import { PatientStatusCard } from "@/components/dashboard/PatientStatusCard";
import { LocationCard } from "@/components/dashboard/LocationCard";
import { HeartRateCard } from "@/components/dashboard/HeartRateCard";
import { ActivityCard } from "@/components/dashboard/ActivityCard";
import { AIHealthCard } from "@/components/dashboard/AIHealthCard";

export default function DashboardHome() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <PatientStatusCard />
      <LocationCard />
      <div className="md:row-span-2 xl:row-span-2">
        <AIHealthCard />
      </div>
      <HeartRateCard />
      <ActivityCard />
    </div>
  );
}
