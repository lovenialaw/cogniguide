import { useEffect, useRef } from "react";
import { usePatientData } from "@/context/PatientDataContext";
import { sendCareAlert } from "@/lib/nativeBridge";

/**
 * Caregiver push alerts fire ONLY after dual verification
 * (smartwatch + home nodes agree). Watch-only events never notify.
 */
export function AlertNotificationBridge() {
  const {
    patient,
    room,
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
      title: `${patient.name} fell in ${room}`,
      body: `Please check on ${patient.name} now.`,
      severity: "high",
      category: "fall",
    });
  }, [fallVerifyStatus, patient.name, room]);

  useEffect(() => {
    if (wanderVerifyStatus !== "confirmed" || alertedWander.current) return;
    alertedWander.current = true;
    void sendCareAlert({
      title: `${patient.name} wandered at ${room}`,
      body: `Please check on ${patient.name} now.`,
      severity: "medium",
      category: "wandering",
    });
  }, [wanderVerifyStatus, patient.name, room]);

  return null;
}
