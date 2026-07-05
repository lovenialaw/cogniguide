import type { RoomName } from "@/types";

export interface PatientPosition {
  x: number;
  y: number;
}

type IndoorRoom = Exclude<RoomName, "Outside Home">;

export const ROOM_CENTERS: Record<IndoorRoom, PatientPosition> = {
  "Living Room": { x: 26, y: 28 },
  Kitchen: { x: 76, y: 28 },
  Bedroom: { x: 26, y: 76 },
  Bathroom: { x: 76, y: 76 },
};

export const HALLWAY: PatientPosition = { x: 50, y: 52 };
export const OUTSIDE_POS: PatientPosition = { x: 50, y: 6 };
export const EXIT_POS: PatientPosition = { x: 50, y: 14 };

const INDOOR_ROOMS: IndoorRoom[] = ["Living Room", "Bedroom", "Kitchen", "Bathroom"];

export function roomFromPosition(p: PatientPosition): RoomName {
  if (p.y < 12) return "Outside Home";
  if (p.y < 50) return p.x < 50 ? "Living Room" : "Kitchen";
  return p.x < 50 ? "Bedroom" : "Bathroom";
}

export function rssiFromPosition(p: PatientPosition): number {
  const dist = Math.hypot(p.x - 50, p.y - 50);
  if (p.y < 12) return Math.round(-78 - dist * 0.15);
  return Math.round(clamp(-32 - dist * 0.55, -85, -38));
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function pickNextRoom(current: RoomName): RoomName {
  if (current === "Outside Home") return "Living Room";
  const others = INDOOR_ROOMS.filter((r) => r !== current);
  return others[Math.floor(Math.random() * others.length)];
}

/** Route through the hallway hub between rooms */
export function buildPath(_from: PatientPosition, toRoom: RoomName, fromRoom: RoomName): PatientPosition[] {
  if (toRoom === "Outside Home") {
    return [HALLWAY, EXIT_POS, OUTSIDE_POS];
  }

  const target = ROOM_CENTERS[toRoom as IndoorRoom];

  if (fromRoom === "Outside Home") {
    return [EXIT_POS, HALLWAY, target];
  }

  if (fromRoom === toRoom) {
    return microPath(target);
  }

  return [HALLWAY, target];
}

/** Small wander path within the same room */
function microPath(center: PatientPosition): PatientPosition[] {
  const angle = Math.random() * Math.PI * 2;
  const radius = 4 + Math.random() * 5;
  return [
    {
      x: clamp(center.x + Math.cos(angle) * radius, 8, 92),
      y: clamp(center.y + Math.sin(angle) * radius, 16, 88),
    },
  ];
}

export function stepToward(
  current: PatientPosition,
  target: PatientPosition,
  speed: number
): { position: PatientPosition; arrived: boolean } {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const dist = Math.hypot(dx, dy);

  if (dist <= speed) {
    return { position: { ...target }, arrived: true };
  }

  return {
    position: {
      x: current.x + (dx / dist) * speed,
      y: current.y + (dy / dist) * speed,
    },
    arrived: false,
  };
}

export function movementSpeed(isWalking: boolean): number {
  return isWalking ? 1.1 : 0.55;
}
