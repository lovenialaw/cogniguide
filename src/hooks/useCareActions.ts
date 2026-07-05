import { useCallback } from "react";
import { CONTACTS, dialPhone, notifyCaregiver, openPatientMaps } from "@/lib/contacts";
import { usePatientData } from "@/context/PatientDataContext";
import { useToast } from "@/context/ToastContext";

export function useCareActions() {
  const { showToast } = useToast();
  const { room, geofence, patient, fallDetected, wanderingAlert } = usePatientData();

  const feedback = useCallback((message: string) => showToast(message), [showToast]);

  const callPatient = useCallback(() => {
    dialPhone(CONTACTS.patient.name, CONTACTS.patient.phone, feedback);
  }, [feedback]);

  const callCaregiver = useCallback(() => {
    dialPhone(CONTACTS.caregiver.name, CONTACTS.caregiver.phone, feedback);
  }, [feedback]);

  const callEmergencyServices = useCallback(() => {
    dialPhone("Emergency Services", CONTACTS.emergency, feedback);
  }, [feedback]);

  const openMaps = useCallback(() => {
    openPatientMaps(room, geofence, feedback);
  }, [room, geofence, feedback]);

  const notifyCaregiverOfAlert = useCallback(() => {
    let summary = "Status update requested";
    if (fallDetected) summary = `Fall detected — patient ${patient.name} in ${room}`;
    else if (wanderingAlert) summary = `Possible wandering — ${patient.name} near ${room} (${geofence})`;
    else summary = `${patient.name} needs attention — last seen in ${room}`;

    notifyCaregiver(summary, (msg) => showToast(msg, "success"));
  }, [fallDetected, wanderingAlert, patient.name, room, geofence, showToast]);

  return {
    callPatient,
    callCaregiver,
    callEmergencyServices,
    openMaps,
    notifyCaregiverOfAlert,
  };
}
