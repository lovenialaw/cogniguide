import { Compass, Gauge } from "lucide-react";
import { MotionStatusCard } from "@/components/live/MotionStatusCard";
import { AxisLineChart } from "@/components/live/AxisLineChart";
import { FallDetectionCard } from "@/components/live/FallDetectionCard";
import { usePatientData } from "@/context/PatientDataContext";

export default function LiveMonitoring() {
  const { accel, gyro, fallDetected } = usePatientData();

  // During an active fall, focus the alert — hide the extra status / chart boxes
  if (fallDetected) {
    return (
      <div className="flex flex-col gap-5 pb-8 max-w-2xl">
        <FallDetectionCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 pb-8">
      <div className="xl:col-span-1">
        <MotionStatusCard />
      </div>
      <div className="xl:col-span-2 flex flex-col gap-5">
        <FallDetectionCard />
        <AxisLineChart
          icon={<Gauge className="h-5 w-5" />}
          title="Accelerometer Data"
          subtitle="Live tri-axial acceleration (g)"
          data={accel}
          domain={[-6, 6]}
          unit="g"
          labels={["Ax", "Ay", "Az"]}
        />
      </div>
      <div className="xl:col-span-3">
        <AxisLineChart
          icon={<Compass className="h-5 w-5" />}
          title="Gyroscope Data"
          subtitle="Live tri-axial angular velocity (°/s)"
          data={gyro}
          domain={[-260, 260]}
          unit="°/s"
          labels={["Gx", "Gy", "Gz"]}
        />
      </div>
    </div>
  );
}
