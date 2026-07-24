import { useCallback, useState } from "react";
import { Antenna, RadioTower } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { WifiNodeMap } from "@/components/wifi/WifiNodeMap";
import { WifiNodeRoomCards } from "@/components/wifi/WifiNodeRoomCards";
import { WifiMotionLog } from "@/components/wifi/WifiMotionLog";
import { DualVerificationCard } from "@/components/wifi/DualVerificationCard";
import type { NodeMotionEvent, WifiNodeLive } from "@/lib/wifiNodes";
import { DEFAULT_WIFI_NODES, seedMotionLogEvents } from "@/lib/wifiNodes";
import { usePatientData } from "@/context/PatientDataContext";

export default function WifiNodeTracking() {
  const {
    fallDetected,
    wanderingAlert,
    fallVerifyStatus,
    wanderVerifyStatus,
    dualVerified,
  } = usePatientData();

  const [nodes, setNodes] = useState<WifiNodeLive[]>(() =>
    DEFAULT_WIFI_NODES.map((n) => ({
      ...n,
      intensity: 1,
      state: "quiet" as const,
      rssiDbm: -55,
    }))
  );
  const [roomOverrides, setRoomOverrides] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [events, setEvents] = useState<NodeMotionEvent[]>(() => seedMotionLogEvents());

  const displayNodes = nodes.map((n) => ({
    ...n,
    room: roomOverrides[n.id] ?? n.room,
  }));

  const fallStatus = fallVerifyStatus;
  const wanderStatus = wanderVerifyStatus;
  const caregiverAlertSent = dualVerified;

  const onNodesChange = useCallback((next: WifiNodeLive[]) => {
    setNodes(next);
  }, []);

  const onMotionEvent = useCallback(
    (evt: NodeMotionEvent) => {
      const roomName = roomOverrides[evt.nodeId] ?? evt.room;
      setEvents((prev) =>
        [
          {
            ...evt,
            room: roomName,
            message: `${evt.state === "strong" ? "Strong motion" : "Motion"} — ${roomName}`,
          },
          ...prev,
        ].slice(0, 80)
      );
    },
    [roomOverrides]
  );

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-mint-500 text-white shadow-glow-brand">
          <RadioTower className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-extrabold text-xl text-ink-900">WiFi Node Tracking</h2>
            <span className="rounded-full bg-mint-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
              New
            </span>
          </div>
          <p className="text-sm text-ink-400">Indoor location via 4 home nodes · alerts need dual verification</p>
        </div>
      </div>

      <GlassCard
        className="p-5 sm:p-6"
        glow={fallStatus === "confirmed" || wanderStatus === "confirmed" ? "danger" : "none"}
      >
        <DualVerificationCard
          fallStatus={fallStatus}
          wanderStatus={wanderStatus}
          fallDetected={fallDetected}
          wanderingAlert={!!wanderingAlert}
          nodes={displayNodes}
          caregiverAlertSent={caregiverAlertSent}
        />
      </GlassCard>

      <GlassCard className="p-5 sm:p-6" glow={wanderingAlert || fallDetected ? "danger" : "brand"}>
        <CardHeader
          icon={<Antenna className="h-5 w-5" />}
          title="Coverage map"
          subtitle="Drag Node 1–4 to match your rooms"
        />
        <WifiNodeMap onNodesChange={onNodesChange} onMotionEvent={onMotionEvent} />
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5 sm:p-6">
          <WifiNodeRoomCards
            nodes={displayNodes}
            editingId={editingId}
            onSelect={(id) => setEditingId((prev) => (prev === id ? null : id))}
            onRename={(id, nextRoom) => {
              setRoomOverrides((prev) => ({ ...prev, [id]: nextRoom }));
              setEditingId(null);
            }}
          />
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <WifiMotionLog
            events={events}
            onDismiss={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
          />
        </GlassCard>
      </div>
    </div>
  );
}
