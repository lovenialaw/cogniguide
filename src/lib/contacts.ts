import type { GeofenceState, RoomName } from "@/types";

export const CONTACTS = {
  patient: {
    name: "Eleanor Whitfield",
    phone: "+15550192838",
  },
  caregiver: {
    name: "Michael Whitfield",
    phone: "+15550192837",
  },
  emergency: "911",
  homeAddress: "742 Willow Creek Lane, Portland, OR 97201",
} as const;

function sanitizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function dialPhone(label: string, phone: string, onFeedback?: (message: string) => void) {
  const href = `tel:${sanitizePhone(phone)}`;
  const link = document.createElement("a");
  link.href = href;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  onFeedback?.(`Calling ${label} at ${formatPhone(phone)}…`);
}

export function openPatientMaps(
  room: RoomName,
  geofence: GeofenceState,
  onFeedback?: (message: string) => void
) {
  const label =
    room === "Outside Home" || geofence !== "Inside Home"
      ? `${CONTACTS.homeAddress} — patient near ${room} (${geofence})`
      : `${CONTACTS.homeAddress} — ${room}`;

  window.open(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`,
    "_blank",
    "noopener,noreferrer"
  );
  onFeedback?.(`Opening map for ${room}…`);
}

export function notifyCaregiver(
  eventSummary: string,
  onFeedback?: (message: string) => void
) {
  const message = `COGNIGUIDE Alert: ${eventSummary} — ${CONTACTS.patient.name}. Please respond immediately.`;
  const smsHref = `sms:${sanitizePhone(CONTACTS.caregiver.phone)}?body=${encodeURIComponent(message)}`;

  const link = document.createElement("a");
  link.href = smsHref;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(message);
  }

  onFeedback?.(`Notified ${CONTACTS.caregiver.name} — message copied to clipboard`);
}

export function alertRouteForEvent(event: string): string {
  if (event === "Fall" || event === "Wandering" || event === "Left Home") return "/emergency";
  return "/alerts";
}
