import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePatientData } from "@/context/PatientDataContext";
import {
  activityCentroid,
  clampPercent,
  computeLiveNodes,
  DEFAULT_WIFI_NODES,
  type NodeMotionEvent,
  type NodeMotionState,
  type WifiNode,
  type WifiNodeLive,
} from "@/lib/wifiNodes";
import { cn } from "@/lib/utils";

const STATE_STYLES: Record<
  NodeMotionState,
  { ring: string; glow: string; text: string; label: string }
> = {
  quiet: {
    ring: "border-mint-400",
    glow: "bg-mint-500/25",
    text: "text-mint-700",
    label: "quiet",
  },
  motion: {
    ring: "border-amber-glow",
    glow: "bg-amber-glow/35",
    text: "text-amber-700",
    label: "motion",
  },
  strong: {
    ring: "border-danger",
    glow: "bg-danger/40",
    text: "text-danger-dark",
    label: "strong",
  },
};

interface WifiNodeMapProps {
  onNodesChange?: (nodes: WifiNodeLive[]) => void;
  onMotionEvent?: (event: NodeMotionEvent) => void;
}

export function WifiNodeMap({ onNodesChange, onMotionEvent }: WifiNodeMapProps) {
  const { patientPosition, isLocationMoving, room } = usePatientData();
  const [nodes, setNodes] = useState<WifiNode[]>(DEFAULT_WIFI_NODES);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const prevStates = useRef<Record<string, NodeMotionState>>({});

  const liveNodes = useMemo(
    () => computeLiveNodes(nodes, patientPosition, isLocationMoving),
    [nodes, patientPosition, isLocationMoving]
  );

  const blob = useMemo(() => activityCentroid(liveNodes), [liveNodes]);

  useEffect(() => {
    onNodesChange?.(liveNodes);
  }, [liveNodes, onNodesChange]);

  useEffect(() => {
    for (const n of liveNodes) {
      const prev = prevStates.current[n.id];
      if (prev && prev === "quiet" && n.state !== "quiet") {
        onMotionEvent?.({
          id: `evt-${Date.now()}-${n.id}`,
          nodeId: n.id,
          nodeLabel: n.label,
          room: n.room,
          state: n.state,
          intensity: n.intensity,
          message: `${n.state === "strong" ? "Strong motion" : "Motion"} detected — ${n.room}`,
          timestamp: new Date(),
        });
      }
      prevStates.current[n.id] = n.state;
    }
  }, [liveNodes, onMotionEvent]);

  const updateNodePosition = useCallback((id: string, clientX: number, clientY: number) => {
    const el = mapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clampPercent(((clientX - rect.left) / rect.width) * 100);
    const y = clampPercent(((clientY - rect.top) / rect.height) * 100);
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);

  useEffect(() => {
    if (!draggingId) return;

    const onMove = (e: PointerEvent) => updateNodePosition(draggingId, e.clientX, e.clientY);
    const onUp = () => setDraggingId(null);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [draggingId, updateNodePosition]);

  return (
    <div
      ref={mapRef}
      className="relative aspect-[16/11] rounded-2xl border-2 border-dashed border-brand-200 bg-gradient-to-br from-ink-50 via-brand-50/40 to-mint-50 overflow-hidden select-none touch-none"
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" aria-hidden>
        <defs>
          <pattern id="wifi-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(20,135,245,0.18)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wifi-grid)" />
      </svg>

      {[
        { name: "Living Room", x: 18, y: 10 },
        { name: "Kitchen", x: 78, y: 10 },
        { name: "Bedroom", x: 18, y: 90 },
        { name: "Bathroom", x: 78, y: 90 },
        { name: "Hallway", x: 50, y: 48 },
        { name: "Exit", x: 50, y: 4 },
      ].map((r) => (
        <span
          key={r.name}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-ink-300 pointer-events-none"
          style={{ left: `${r.x}%`, top: `${r.y}%` }}
        >
          {r.name}
        </span>
      ))}

      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-bold text-brand-700">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse-slow" />
        LIVE NODES
      </div>
      <p className="absolute top-3 right-3 text-[11px] font-medium text-ink-400">
        drag nodes to match your rooms
      </p>

      {blob && (
        <motion.div
          animate={{ left: `${blob.x}%`, top: `${blob.y}%` }}
          transition={{ type: "tween", duration: 0.25, ease: "linear" }}
          className="absolute z-[5] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div className="relative flex h-28 w-28 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-brand-500/20 blur-md" />
            <span className="absolute inset-3 rounded-full bg-brand-500/25 animate-pulse-slow" />
            <span className="relative text-[11px] font-extrabold uppercase tracking-wide text-brand-700">
              activity
            </span>
          </div>
        </motion.div>
      )}

      <motion.div
        animate={{ left: `${patientPosition.x}%`, top: `${patientPosition.y}%` }}
        transition={{ type: "tween", duration: 0.08, ease: "linear" }}
        className="absolute z-[6] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <span className="flex h-3 w-3 rounded-full bg-ink-800 ring-2 ring-white shadow" title={`Patient · ${room}`} />
      </motion.div>

      {liveNodes.map((node) => {
        const style = STATE_STYLES[node.state];
        const glowSize = node.state === "quiet" ? 40 : node.state === "motion" ? 72 : 96;
        return (
          <div
            key={node.id}
            onPointerDown={(e) => {
              e.preventDefault();
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              setDraggingId(node.id);
            }}
            className={cn(
              "absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing",
              draggingId === node.id && "z-20"
            )}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div className="relative flex flex-col items-center">
              <span
                className={cn("absolute rounded-full blur-md transition-all duration-300", style.glow)}
                style={{
                  width: glowSize,
                  height: glowSize,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-full border-[3px] bg-white shadow-md",
                  style.ring
                )}
              >
                <span className={cn("absolute h-7 w-7 rounded-full border-2 opacity-50", style.ring)} />
                <span className={cn("absolute h-4 w-4 rounded-full border-2", style.ring)} />
                <span className="relative h-2 w-2 rounded-full bg-ink-700" />
              </div>
              <div className="mt-1.5 rounded-lg bg-white/90 px-1.5 py-0.5 text-center shadow-sm border border-ink-100">
                <p className="text-[11px] font-extrabold text-ink-800 leading-none">{node.id}</p>
                <p className={cn("text-[10px] font-bold leading-tight", style.text)}>
                  {node.rssiDbm} dBm · {style.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2 text-[11px] text-ink-400">
        <p>ESP32 nodes read smartwatch Wi-Fi RSSI. Glow = CSI motion. Blob = estimated location.</p>
        <div className="flex items-center gap-3 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-mint-500" /> quiet
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-glow" /> motion
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-danger" /> strong
          </span>
        </div>
      </div>
    </div>
  );
}
