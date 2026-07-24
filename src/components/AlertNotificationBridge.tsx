import { useEffect, useRef } from "react";
import { usePatientData } from "@/context/PatientDataContext";
import { sendCareAlert } from "@/lib/nativeBridge";

/** Watches critical patient state and pushes native / browser notifications. */
export function AlertNotificationBridge() {
  const { fallDetected, fallEvent, wanderingAlert, room, patient } = usePatientData();
  const prevFall = useRef(false);
  const prevWander = useRef(false);

  useEffect(() => {
    if (fallDetected && !prevFall.current) {
      void sendCareAlert({
        title: "⚠ Fall Detected",
        body: `${patient.name} — possible fall in ${room}${fallEvent ? ` at ${fallEvent.time}` : ""}. Open Emergency now.`,
        severity: "high",
        category: "fall",
      });
    }
    prevFall.current = fallDetected;
  }, [fallDetected, fallEvent, room, patient.name]);

  useEffect(() => {
    if (wanderingAlert && !prevWander.current) {
      void sendCareAlert({
        title: "⚠ Wandering Alert",
        body: `${patient.name} may be leaving the safe zone (${room}). Check Location / Emergency.`,
        severity: "medium",
        category: "wandering",
      });
    }
    prevWander.current = !!wanderingAlert;
  }, [wanderingAlert, room, patient.name]);

  return null;
}
