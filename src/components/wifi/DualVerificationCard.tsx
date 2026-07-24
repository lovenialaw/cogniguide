import { CheckCircle2, Clock3, Cpu, ShieldCheck, Smartphone, XCircle } from "lucide-react";
import type { DualVerifyStatus, WifiNodeLive } from "@/lib/wifiNodes";
import { strongestNode } from "@/lib/wifiNodes";
import { cn } from "@/lib/utils";

function StatusPill({ status }: { status: DualVerifyStatus }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-mint-500/15 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-mint-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> Dual-verified
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-glow/15 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-amber-700">
        <Clock3 className="h-3.5 w-3.5" /> Awaiting home nodes
      </span>
    );
  }
  if (status === "watch_only") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-ink-500">
        <XCircle className="h-3.5 w-3.5" /> Watch only — no alert
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-mint-500/10 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-mint-700">
      <ShieldCheck className="h-3.5 w-3.5" /> Idle
    </span>
  );
}

function VoteCard({
  title,
  icon,
  agreed,
  detail,
}: {
  title: string;
  icon: React.ReactNode;
  agreed: boolean | null;
  detail: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3",
        agreed === true && "border-mint-400/50 bg-mint-500/8",
        agreed === false && "border-ink-100 bg-ink-50",
        agreed === null && "border-amber-glow/40 bg-amber-glow/8"
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-ink-500">{icon}</span>
        <p className="text-xs font-bold text-ink-700">{title}</p>
        <span
          className={cn(
            "ml-auto text-[10px] font-extrabold uppercase",
            agreed === true && "text-mint-700",
            agreed === false && "text-ink-400",
            agreed === null && "text-amber-700"
          )}
        >
          {agreed === true ? "Agree" : agreed === false ? "No signal" : "Checking…"}
        </span>
      </div>
      <p className="text-xs text-ink-500 leading-relaxed">{detail}</p>
    </div>
  );
}

export function DualVerificationCard({
  fallStatus,
  wanderStatus,
  fallDetected,
  wanderingAlert,
  nodes,
  caregiverAlertSent,
}: {
  fallStatus: DualVerifyStatus;
  wanderStatus: DualVerifyStatus;
  fallDetected: boolean;
  wanderingAlert: boolean;
  nodes: WifiNodeLive[];
  caregiverAlertSent: boolean;
}) {
  const nearest = strongestNode(nodes);
  const active = fallDetected || !!wanderingAlert;
  const overall =
    fallStatus === "confirmed" || wanderStatus === "confirmed"
      ? "confirmed"
      : fallStatus === "pending" || wanderStatus === "pending"
        ? "pending"
        : fallStatus === "watch_only" || wanderStatus === "watch_only"
          ? "watch_only"
          : "idle";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display font-bold text-ink-900">Dual verification</p>
          <p className="text-xs text-ink-400 mt-0.5">
            Caregiver alerts fire only when the smartwatch and ESP32 home nodes both agree
          </p>
        </div>
        <StatusPill status={overall} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <VoteCard
          title="Smartwatch"
          icon={<Smartphone className="h-4 w-4" />}
          agreed={fallDetected || wanderingAlert ? true : active ? null : false}
          detail={
            fallDetected
              ? "IMU fall pattern detected — waiting for stillness confirmation"
              : wanderingAlert
                ? "Geofence / motion flags possible exit"
                : "No watch-side emergency event"
          }
        />
        <VoteCard
          title="Home ESP32 nodes"
          icon={<Cpu className="h-4 w-4" />}
          agreed={
            overall === "confirmed" ? true : overall === "pending" ? null : overall === "watch_only" ? false : false
          }
          detail={
            fallDetected
              ? overall === "confirmed"
                ? `Nearest ${nearest?.id ?? "node"} sees stillness after impact (RSSI ${nearest?.rssiDbm ?? "—"} dBm)`
                : `Checking motionless state via CSI/RSSI at ${nearest?.room ?? "nearest room"}…`
              : wanderingAlert
                ? overall === "confirmed"
                  ? `Nodes confirm presence near exit side · strongest ${nearest?.id} (${nearest?.rssiDbm} dBm)`
                  : "Tracking RSSI as patient approaches exit…"
                : "Four ESP32 nodes monitoring watch Wi-Fi RSSI"
          }
        />
      </div>

      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm font-semibold",
          caregiverAlertSent
            ? "bg-danger/10 border border-danger/25 text-danger-dark"
            : overall === "pending"
              ? "bg-amber-glow/10 border border-amber-glow/25 text-amber-800"
              : "bg-ink-50 border border-ink-100 text-ink-600"
        )}
      >
        {caregiverAlertSent
          ? "Emergency alert sent to caregivers — both sensors agreed."
          : overall === "pending"
            ? "Hold: watch flagged an event, but home nodes have not confirmed yet — no caregiver alert."
            : overall === "confirmed"
              ? "Consensus reached — caregiver alert authorized."
              : "No dual-verified emergency. Single-source detections stay local until both sides agree."}
      </div>
    </div>
  );
}
