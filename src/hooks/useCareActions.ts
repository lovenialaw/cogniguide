import { useCallback } from "react";
import { CONTACTS, dialPhone, notifyCaregiver, openPatientMaps } from "@/lib/contacts";
import { usePatientData } from "@/context/PatientDataContext";
import { useToast } from "@/context/ToastContext";

export function useCareActions() {
  const { showToast } = useToast();
  const {
    room,
    geofence,
    patient,
    fallDetected,
    wanderingAlert,
    dualVerified,
    fallVerifyStatus,
    wanderVerifyStatus,
  } = usePatientData();

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
    if ((fallDetected || wanderingAlert) && !dualVerified) {
      showToast(
        "Hold: home ESP32 nodes have not confirmed yet — caregiver alert blocked until both sensors agree.",
        "info"
      );
      return;
    }

    let summary = "Status update requested";
    if (fallVerifyStatus === "confirmed") {
      summary = `${patient.name} fell in ${room}`;
    } else if (wanderVerifyStatus === "confirmed") {
      summary = `${patient.name} wandered at ${geofence === "Outside Home" || geofence === "Near Exit" ? geofence : room}`;
    } else {
      summary = `${patient.name} needs attention — last seen in ${room}`;
    }

    notifyCaregiver(summary, (msg) => showToast(msg, "success"));
  }, [
    fallDetected,
    wanderingAlert,
    dualVerified,
    fallVerifyStatus,
    wanderVerifyStatus,
    patient.name,
    room,
    geofence,
    showToast,
  ]);

  return {
    callPatient,
    callCaregiver,
    callEmergencyServices,
    openMaps,
    notifyCaregiverOfAlert,
  };
}
