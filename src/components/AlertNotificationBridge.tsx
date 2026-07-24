import { useEffect, useRef } from "react";
import { usePatientData } from "@/context/PatientDataContext";
import { sendCareAlert } from "@/lib/nativeBridge";

/**
 * Caregiver push alerts fire ONLY after dual verification
 * (smartwatch + ESP32 home nodes agree). Watch-only events never notify.
 */
export function AlertNotificationBridge() {
  const {
    patient,
    room,
    geofence,
    fallEvent,
    fallVerifyStatus,
    wanderVerifyStatus,
    fallDetected,
    wanderingAlert,
  } = usePatientData();

  const alertedFall = useRef(false);
  const alertedWander = useRef(false);

  useEffect(() => {
    if (!fallDetected) alertedFall.current = false;
  }, [fallDetected]);

  useEffect(() => {
    if (!wanderingAlert) alertedWander.current = false;
  }, [wanderingAlert]);

  useEffect(() => {
    if (fallVerifyStatus !== "confirmed" || alertedFall.current) return;
    alertedFall.current = true;
    const place = room || "an unknown room";
    void sendCareAlert({
      title: `${patient.name} fell in ${place}`,
      body: fallEvent
        ? `Dual-verified fall (${fallEvent.severity}) at ${fallEvent.time}. Smartwatch + home ESP32 nodes agree — respond now.`
        : `Dual-verified fall. Smartwatch + home ESP32 nodes agree — respond now.`,
      severity: "high",
      category: "fall",
    });
  }, [fallVerifyStatus, patient.name, room, fallEvent]);

  useEffect(() => {
    if (wanderVerifyStatus !== "confirmed" || alertedWander.current) return;
    alertedWander.current = true;
    const place =
      geofence === "Outside Home" || geofence === "Near Exit"
        ? geofence
        : room || "an unknown area";
    void sendCareAlert({
      title: `${patient.name} wandered at ${place}`,
      body: `Last seen near ${room}. Dual-verified by watch geofence + home ESP32 RSSI — respond now.`,
      severity: "medium",
      category: "wandering",
    });
  }, [wanderVerifyStatus, patient.name, room, geofence]);

  return null;
}
