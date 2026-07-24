import { Radio, Wifi } from "lucide-react";
import type { NodeMotionState, WifiNodeLive } from "@/lib/wifiNodes";
import { cn } from "@/lib/utils";

const STATE_META: Record<NodeMotionState, { border: string; badge: string; label: string }> = {
  quiet: {
    border: "border-mint-400/60",
    badge: "bg-mint-500/12 text-mint-700",
    label: "quiet",
  },
  motion: {
    border: "border-amber-glow/70",
    badge: "bg-amber-glow/15 text-amber-700",
    label: "motion",
  },
  strong: {
    border: "border-danger/70",
    badge: "bg-danger/12 text-danger-dark",
    label: "strong",
  },
};

export function WifiNodeRoomCards({
  nodes,
  editingId,
  onSelect,
  onRename,
}: {
  nodes: WifiNodeLive[];
  editingId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, room: string) => void;
}) {
  return (
    <div>
      <div className="mb-4">
        <p className="font-display font-bold text-ink-900">Home nodes</p>
        <p className="text-xs text-ink-400 mt-0.5">Tap a room name to edit</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {nodes.map((node) => {
          const meta = STATE_META[node.state];
          const isEditing = editingId === node.id;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelect(node.id)}
              className={cn(
                "rounded-2xl border-2 bg-white/70 px-4 py-4 text-left transition-all hover:bg-white",
                meta.border,
                isEditing && "ring-2 ring-brand-400/40"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="flex items-center gap-1.5 text-sm font-bold text-ink-700">
                  <Radio className="h-3.5 w-3.5 text-ink-400" />
                  {node.label}
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", meta.badge)}>
                  {meta.label}
                </span>
              </div>
              {isEditing ? (
                <input
                  autoFocus
                  defaultValue={node.room}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={(e) => onRename(node.id, e.target.value.trim() || node.room)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="w-full rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-sm font-bold text-ink-800 outline-none focus:border-brand-400"
                />
              ) : (
                <p className="text-sm font-bold text-ink-800 truncate">{node.room}</p>
              )}
              <p className="text-[11px] text-ink-400 mt-1.5 flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                {node.rssiDbm} dBm
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
