import { useCallback, useState } from "react";
import { Antenna, RadioTower, Sparkles } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { WifiNodeMap } from "@/components/wifi/WifiNodeMap";
import { WifiNodeRoomCards } from "@/components/wifi/WifiNodeRoomCards";
import { WifiMotionLog } from "@/components/wifi/WifiMotionLog";
import { DualVerificationCard } from "@/components/wifi/DualVerificationCard";
import type { NodeMotionEvent, WifiNodeLive } from "@/lib/wifiNodes";
import { DEFAULT_WIFI_NODES, seedMotionLogEvents } from "@/lib/wifiNodes";
import { usePatientData } from "@/context/PatientDataContext";

export default function WifiNodeTracking() {
  const { fallDetected, wanderingAlert, fallVerifyStatus, wanderVerifyStatus, dualVerified } =
    usePatientData();

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

  const activeCount = displayNodes.filter((n) => n.state !== "quiet").length;

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
            message: `Motion — ${roomName}`,
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
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-mint-500 text-white shadow-glow-brand">
          <RadioTower className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display font-extrabold text-xl text-ink-900">WiFi Node Tracking</h2>
          <p className="text-sm text-ink-400">Nodes 1–4 · indoor location · dual-verify alerts</p>
        </div>
      </div>

      <GlassCard
        className="p-5"
        glow={
          fallVerifyStatus === "confirmed" || wanderVerifyStatus === "confirmed" ? "danger" : "none"
        }
      >
        <DualVerificationCard
          fallStatus={fallVerifyStatus}
          wanderStatus={wanderVerifyStatus}
          fallDetected={fallDetected}
          wanderingAlert={!!wanderingAlert}
          nodes={displayNodes}
          caregiverAlertSent={dualVerified}
        />
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <GlassCard className="p-5 xl:col-span-3" glow={wanderingAlert || fallDetected ? "danger" : "brand"}>
          <CardHeader
            icon={<Antenna className="h-5 w-5" />}
            title="Coverage map"
            subtitle="Drag nodes to place them"
            action={
              <span className="flex items-center gap-1.5 rounded-full bg-mint-500/10 px-2.5 py-1 text-[11px] font-bold text-mint-700">
                <Sparkles className="h-3.5 w-3.5" />
                {activeCount} active
              </span>
            }
          />
          <div className="mt-2">
            <WifiNodeMap onNodesChange={onNodesChange} onMotionEvent={onMotionEvent} />
          </div>
        </GlassCard>

        <GlassCard className="p-5 xl:col-span-2">
          <WifiMotionLog
            events={events}
            onDismiss={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
          />
        </GlassCard>

        <GlassCard className="p-5 xl:col-span-5">
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
      </div>
    </div>
  );
}
