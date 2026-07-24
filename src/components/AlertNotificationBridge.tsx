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
    void sendCareAlert({
      title: "⚠ Dual-Verified Fall",
      body: `${patient.name}: smartwatch + ESP32 home nodes agree on a fall in ${room}${
        fallEvent ? ` (${fallEvent.severity}, ${fallEvent.time})` : ""
      }. Emergency alert sent to caregivers.`,
      severity: "high",
      category: "fall",
    });
  }, [fallVerifyStatus, patient.name, room, fallEvent]);

  useEffect(() => {
    if (wanderVerifyStatus !== "confirmed" || alertedWander.current) return;
    alertedWander.current = true;
    void sendCareAlert({
      title: "⚠ Dual-Verified Wandering",
      body: `${patient.name}: watch geofence + home ESP32 RSSI both confirm exit-side presence (${room}). Emergency alert sent to caregivers.`,
      severity: "medium",
      category: "wandering",
    });
  }, [wanderVerifyStatus, patient.name, room]);

  return null;
}
