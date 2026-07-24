import { useEffect, useMemo, useRef } from "react";
import { usePatientData } from "@/context/PatientDataContext";
import { sendCareAlert } from "@/lib/nativeBridge";
import {
  computeLiveNodes,
  DEFAULT_WIFI_NODES,
  verifyFallConsensus,
  verifyWanderingConsensus,
} from "@/lib/wifiNodes";

/**
 * Caregiver push alerts for fall / wandering fire only after dual verification:
 * smartwatch event + ESP32 home nodes agree (stillness after fall, or exit-side RSSI for wandering).
 */
export function AlertNotificationBridge() {
  const {
    patient,
    room,
    geofence,
    patientPosition,
    isLocationMoving,
    fallDetected,
    fallEvent,
    wanderingAlert,
  } = usePatientData();

  const alertedFall = useRef(false);
  const alertedWander = useRef(false);

  const nodes = useMemo(
    () => computeLiveNodes(DEFAULT_WIFI_NODES, patientPosition, isLocationMoving),
    [patientPosition, isLocationMoving]
  );

  const fallStatus = useMemo(
    () =>
      verifyFallConsensus({
        fallDetected,
        isMoving: isLocationMoving,
        nodes,
      }),
    [fallDetected, isLocationMoving, nodes]
  );

  const wanderStatus = useMemo(
    () =>
      verifyWanderingConsensus({
        wanderingAlert: !!wanderingAlert,
        geofence,
        room,
        nodes,
        patientPos: patientPosition,
      }),
    [wanderingAlert, geofence, room, nodes, patientPosition]
  );

  useEffect(() => {
    if (!fallDetected) alertedFall.current = false;
  }, [fallDetected]);

  useEffect(() => {
    if (!wanderingAlert) alertedWander.current = false;
  }, [wanderingAlert]);

  useEffect(() => {
    if (fallStatus !== "confirmed" || alertedFall.current) return;
    alertedFall.current = true;
    void sendCareAlert({
      title: "⚠ Dual-Verified Fall",
      body: `${patient.name}: smartwatch + ESP32 nodes agree on a fall in ${room}${
        fallEvent ? ` (${fallEvent.severity}, ${fallEvent.time})` : ""
      }. Emergency alert sent.`,
      severity: "high",
      category: "fall",
    });
  }, [fallStatus, patient.name, room, fallEvent]);

  useEffect(() => {
    if (wanderStatus !== "confirmed" || alertedWander.current) return;
    alertedWander.current = true;
    void sendCareAlert({
      title: "⚠ Dual-Verified Wandering",
      body: `${patient.name}: watch geofence + home ESP32 RSSI both confirm exit-side presence (${room}). Caregiver alert sent.`,
      severity: "medium",
      category: "wandering",
    });
  }, [wanderStatus, patient.name, room]);

  return null;
}
