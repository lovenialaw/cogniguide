import { motion } from "framer-motion";
import { Home as HomeIcon, User } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { usePatientData } from "@/context/PatientDataContext";
import type { RoomName } from "@/types";

const INDOOR_ROOMS: Exclude<RoomName, "Outside Home">[] = [
  "Living Room",
  "Kitchen",
  "Bedroom",
  "Bathroom",
];

export function HomeFloorPlan() {
  const { room, patientPosition, locationTrail, isLocationMoving } = usePatientData();
  const isOutside = room === "Outside Home";

  const trailPath = locationTrail
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <GlassCard className="p-6">
      <CardHeader
        icon={<HomeIcon className="h-5 w-5" />}
        title="Home Safe Zone"
        subtitle="Wi-Fi RSSI indoor localization"
        action={
          <span className="flex items-center gap-1.5 rounded-full bg-mint-500/10 px-2.5 py-1 text-[11px] font-bold text-mint-700">
            <span className={`h-1.5 w-1.5 rounded-full bg-mint-500 ${isLocationMoving ? "animate-pulse-slow" : ""}`} />
            {isLocationMoving ? "Tracking" : "Live"}
          </span>
        }
      />

      <div className="relative aspect-[16/11] rounded-2xl border-2 border-dashed border-brand-200 bg-gradient-to-br from-brand-50 to-mint-50 overflow-hidden">
        {/* Hallway corridors */}
        <div className="absolute inset-4 pointer-events-none">
          <div className="absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 rounded-full bg-brand-200/40" />
          <div className="absolute top-1/2 left-0 right-0 h-3 -translate-y-1/2 rounded-full bg-brand-200/40" />
        </div>

        <div className="absolute inset-4 grid grid-cols-2 grid-rows-2 gap-3">
          {INDOOR_ROOMS.map((r) => (
            <div
              key={r}
              className={`relative rounded-xl border-2 flex items-start p-3 transition-colors duration-500 ${
                room === r ? "border-brand-400 bg-brand-500/8 shadow-glow-brand" : "border-ink-200/70 bg-white/50"
              }`}
            >
              <span
                className={`text-[11px] font-bold uppercase tracking-wide transition-colors ${
                  room === r ? "text-brand-600" : "text-ink-400"
                }`}
              >
                {r}
              </span>
            </div>
          ))}
        </div>

        {/* Outside zone label */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-danger/60">
          Outside
        </div>

        {/* Movement trail */}
        {locationTrail.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={trailPath}
              fill="none"
              stroke="rgba(20, 135, 245, 0.35)"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}

        {/* Patient marker — smooth live position */}
        <motion.div
          animate={{ left: `${patientPosition.x}%`, top: `${patientPosition.y}%` }}
          transition={{ type: "tween", duration: 0.08, ease: "linear" }}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative flex items-center justify-center">
            <span
              className={`absolute h-10 w-10 rounded-full ${isOutside ? "bg-danger/40" : "bg-brand-500/35"} animate-marker-ping`}
            />
            <span
              className={`relative flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white shadow-lg ${
                isOutside ? "bg-danger" : "bg-brand-500"
              }`}
            >
              <User className="h-3 w-3 text-white" strokeWidth={2.5} />
            </span>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-ink-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Patient position
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-6 rounded-full bg-brand-300/60" /> Movement trail
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-brand-400" /> Room boundary
        </span>
      </div>
    </GlassCard>
  );
}
