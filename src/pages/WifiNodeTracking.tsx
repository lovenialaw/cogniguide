import { useCallback, useState } from "react";
import { Antenna, RadioTower, Sparkles } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { WifiNodeMap } from "@/components/wifi/WifiNodeMap";
import { WifiNodeRoomCards } from "@/components/wifi/WifiNodeRoomCards";
import { WifiMotionLog } from "@/components/wifi/WifiMotionLog";
import type { NodeMotionEvent, WifiNodeLive } from "@/lib/wifiNodes";
import { DEFAULT_WIFI_NODES, seedMotionLogEvents } from "@/lib/wifiNodes";
import { sendCareAlert } from "@/lib/nativeBridge";
import { usePatientData } from "@/context/PatientDataContext";

export default function WifiNodeTracking() {
  const { patient } = usePatientData();
  const [nodes, setNodes] = useState<WifiNodeLive[]>(() =>
    DEFAULT_WIFI_NODES.map((n) => ({ ...n, intensity: 1, state: "quiet" as const }))
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
      const room = roomOverrides[evt.nodeId] ?? evt.room;
      const nextEvt = {
        ...evt,
        room,
        message: `${evt.state === "strong" ? "Strong motion" : "Motion"} detected — ${room}`,
      };
      setEvents((prev) => [nextEvt, ...prev].slice(0, 80));

      if (evt.state === "strong") {
        void sendCareAlert({
          title: "WiFi Node — Strong Motion",
          body: `${patient.name}: strong presence at ${room} (${evt.nodeId}).`,
          severity: "medium",
          category: "wifi_motion",
        });
      }
    },
    [roomOverrides, patient.name]
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
            Passive Wi-Fi CSI nodes detect elderly presence in every room — no wearables required
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <GlassCard className="p-5 xl:col-span-2" glow="brand">
          <CardHeader
            icon={<Antenna className="h-5 w-5" />}
            title="Node coverage map"
            subtitle="Drag nodes to match your floor plan"
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
            onRename={(id, room) => {
              setRoomOverrides((prev) => ({ ...prev, [id]: room }));
              setEditingId(null);
            }}
          />
        </GlassCard>
      </div>
    </div>
  );
}
