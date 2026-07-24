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

const STATE_STYLES: Record<NodeMotionState, { ring: string; glow: string }> = {
  quiet: { ring: "border-mint-400", glow: "bg-mint-500/25" },
  motion: { ring: "border-amber-glow", glow: "bg-amber-glow/35" },
  strong: { ring: "border-danger", glow: "bg-danger/40" },
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
          message: `${n.state === "strong" ? "Strong motion" : "Motion"} — ${n.room}`,
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
      className="relative min-h-[320px] sm:min-h-[380px] aspect-[16/10] rounded-2xl border border-brand-100 bg-gradient-to-br from-ink-50 via-brand-50/30 to-mint-50 overflow-hidden select-none touch-none"
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" aria-hidden>
        <defs>
          <pattern id="wifi-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(20,135,245,0.16)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wifi-grid)" />
      </svg>

      {/* Soft room zones — no crowded labels on the map */}
      <div className="absolute left-[8%] top-[8%] h-[34%] w-[38%] rounded-2xl bg-white/25 pointer-events-none" />
      <div className="absolute right-[8%] top-[8%] h-[34%] w-[38%] rounded-2xl bg-white/25 pointer-events-none" />
      <div className="absolute left-[8%] bottom-[10%] h-[34%] w-[38%] rounded-2xl bg-white/25 pointer-events-none" />
      <div className="absolute right-[8%] bottom-[10%] h-[34%] w-[38%] rounded-2xl bg-white/25 pointer-events-none" />

      {blob && (
        <motion.div
          animate={{ left: `${blob.x}%`, top: `${blob.y}%` }}
          transition={{ type: "tween", duration: 0.25, ease: "linear" }}
          className="absolute z-[5] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div className="relative h-20 w-20">
            <span className="absolute inset-0 rounded-full bg-brand-500/20 blur-md" />
            <span className="absolute inset-4 rounded-full bg-brand-500/20 animate-pulse-slow" />
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
        const glowSize = node.state === "quiet" ? 36 : node.state === "motion" ? 64 : 88;
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
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-[3px] bg-white shadow-md",
                  style.ring
                )}
              >
                <span className="relative h-2 w-2 rounded-full bg-ink-700" />
              </div>
              <p className="mt-1.5 rounded-md bg-white/95 px-2 py-0.5 text-[11px] font-bold text-ink-800 shadow-sm border border-ink-100">
                {node.label}
              </p>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-4 text-[11px] font-semibold text-ink-400 pointer-events-none">
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
  );
}
