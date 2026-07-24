import { WanderingAlertCard } from "@/components/location/WanderingAlertCard";
import { HomeFloorPlan } from "@/components/location/HomeFloorPlan";
import { LiveLocationPreview } from "@/components/location/LiveLocationPreview";
import { WifiStatusCard } from "@/components/location/WifiStatusCard";
import { GeofenceStatusCard } from "@/components/location/GeofenceStatusCard";

export default function LocationMonitoring() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="xl:col-span-3">
        <WanderingAlertCard />
      </div>
      <div className="xl:col-span-2 flex flex-col gap-5">
        <HomeFloorPlan />
        <LiveLocationPreview />
      </div>
      <div className="flex flex-col gap-5">
        <WifiStatusCard />
        <GeofenceStatusCard />
      </div>
    </div>
  );
}
