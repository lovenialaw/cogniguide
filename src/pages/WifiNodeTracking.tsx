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

  const activeCount = displayNodes.filter((n) => n.state !== "quiet").length;
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
            message: `${evt.state === "strong" ? "Strong CSI motion" : "CSI motion"} — ${roomName}`,
          },
          ...prev,
        ].slice(0, 80)
      );
      // No caregiver push on raw node motion — only dual-verified fall/wandering
    },
    [roomOverrides]
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-mint-500 text-white shadow-glow-brand">
          <RadioTower className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-extrabold text-xl text-ink-900">WiFi Node Tracking</h2>
            <span className="rounded-full bg-mint-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-glow-mint">
              New
            </span>
          </div>
          <p className="text-sm text-ink-400">
            Four ESP32 nodes read smartwatch Wi-Fi RSSI for indoor location — caregiver alerts need dual verification
          </p>
        </div>
      </div>

      <GlassCard
        className="p-5"
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <GlassCard className="p-5 xl:col-span-2" glow={wanderingAlert || fallDetected ? "danger" : "brand"}>
          <CardHeader
            icon={<Antenna className="h-5 w-5" />}
            title="ESP32 RSSI coverage map"
            subtitle={
              fallDetected
                ? fallStatus === "confirmed"
                  ? "Dual-verified fall — nodes confirmed stillness after impact"
                  : "Watch fall flagged — waiting for ESP32 stillness confirmation"
                : wanderingAlert
                  ? wanderStatus === "confirmed"
                    ? "Dual-verified wandering — watch + nodes agree"
                    : "Watch flagged exit — waiting for ESP32 RSSI confirmation"
                  : "Drag nodes to match your floor plan"
            }
            action={
              <span className="flex items-center gap-1.5 rounded-full bg-mint-500/10 px-2.5 py-1 text-[11px] font-bold text-mint-700">
                <Sparkles className="h-3.5 w-3.5" />
                {activeCount} active
              </span>
            }
          />
          <WifiNodeMap onNodesChange={onNodesChange} onMotionEvent={onMotionEvent} />
        </GlassCard>

        <GlassCard className="p-5">
          <WifiMotionLog
            events={events}
            onDismiss={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
          />
        </GlassCard>

        <GlassCard className="p-5 xl:col-span-3">
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
