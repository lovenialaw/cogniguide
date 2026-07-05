import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { generateAlertHistory, generateAxisWindow, generateHeartRateHistory } from "@/lib/mockData";
import {
  ROOM_CENTERS,
  buildPath,
  movementSpeed,
  pickNextRoom,
  roomFromPosition,
  rssiFromPosition,
  stepToward,
  type PatientPosition,
} from "@/lib/locationSimulation";
import { clamp, randomWalk } from "@/lib/utils";
import type {
  ActivitySummary,
  AlertRecord,
  AxisPoint,
  GeofenceState,
  HeartRatePoint,
  MotionState,
  Patient,
  PatientStatus,
  RiskLevel,
  RoomName,
  WifiStatus,
} from "@/types";

interface FallEvent {
  severity: "High" | "Medium" | "Low";
  time: string;
}

interface WanderingEvent {
  time: string;
  confidence: number;
  durationMinutes: number;
}

interface PatientDataState {
  patient: Patient;
  status: PatientStatus;
  wifiStatus: WifiStatus;
  rssi: number;
  room: RoomName;
  patientPosition: PatientPosition;
  locationTrail: PatientPosition[];
  roomHistory: RoomName[];
  isLocationMoving: boolean;
  locationHeading: string | null;
  heartRate: number;
  heartRateHistory: HeartRatePoint[];
  heartRateMin: number;
  heartRateMax: number;
  spo2: number;
  temperature: number;
  stress: number;
  motion: MotionState;
  motionConfidence: number;
  accel: AxisPoint[];
  gyro: AxisPoint[];
  fallDetected: boolean;
  fallEvent: FallEvent | null;
  activity: ActivitySummary;
  aiRisk: { level: RiskLevel; confidence: number };
  geofence: GeofenceState;
  wanderingAlert: WanderingEvent | null;
  alerts: AlertRecord[];
  aiConfidence: { fallDetection: number; wandering: number };
  emergencyActive: boolean;
}

interface PatientDataContextValue extends PatientDataState {
  simulateFall: () => void;
  dismissFall: () => void;
  simulateWandering: () => void;
  dismissWandering: () => void;
  resolveAlert: (id: string) => void;
  endEmergency: () => void;
}

export type { PatientDataContextValue };

const PatientDataContext = createContext<PatientDataContextValue | null>(null);

function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function PatientDataProvider({ children }: { children: ReactNode }) {
  const [patient] = useState<Patient>({
    name: "Eleanor Whitfield",
    age: 78,
    stage: "Moderate (Stage 2)",
    status: "Safe at Home",
    lastUpdated: new Date(),
    avatarInitials: "EW",
  });

  const [status, setStatus] = useState<PatientStatus>("Safe at Home");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [wifiStatus, setWifiStatus] = useState<WifiStatus>("Connected");
  const [rssi, setRssi] = useState(-46);
  const [room, setRoom] = useState<RoomName>("Living Room");
  const [patientPosition, setPatientPosition] = useState<PatientPosition>(ROOM_CENTERS["Living Room"]);
  const [locationTrail, setLocationTrail] = useState<PatientPosition[]>([ROOM_CENTERS["Living Room"]]);
  const [roomHistory, setRoomHistory] = useState<RoomName[]>(["Living Room"]);
  const [isLocationMoving, setIsLocationMoving] = useState(false);
  const [locationHeading, setLocationHeading] = useState<string | null>(null);

  const positionRef = useRef<PatientPosition>(ROOM_CENTERS["Living Room"]);
  const pathRef = useRef<PatientPosition[]>([]);
  const pathIndexRef = useRef(0);
  const pauseUntilRef = useRef(0);
  const destinationRef = useRef<RoomName>("Living Room");
  const trailTickRef = useRef(0);

  const heartHistoryRef = useRef<HeartRatePoint[]>(generateHeartRateHistory(24, 30));
  const [heartRateHistory, setHeartRateHistory] = useState<HeartRatePoint[]>(heartHistoryRef.current);
  const [heartRate, setHeartRate] = useState(72);
  const [heartRateMin, setHeartRateMin] = useState(64);
  const [heartRateMax, setHeartRateMax] = useState(88);

  const [spo2, setSpo2] = useState(97);
  const [temperature, setTemperature] = useState(98.4);
  const [stress, setStress] = useState(28);

  const [motion, setMotion] = useState<MotionState>("Walking");
  const [motionConfidence, setMotionConfidence] = useState(98);
  const [accel, setAccel] = useState<AxisPoint[]>(() => generateAxisWindow(40, 1.2));
  const [gyro, setGyro] = useState<AxisPoint[]>(() => generateAxisWindow(40, 40, 0));

  const [fallDetected, setFallDetected] = useState(false);
  const [fallEvent, setFallEvent] = useState<FallEvent | null>(null);
  const [emergencyActive, setEmergencyActive] = useState(false);

  const [activity, setActivity] = useState<ActivitySummary>({
    steps: 2840,
    stepGoal: 5000,
    walkingMinutes: 62,
    sittingMinutes: 305,
    sleepHours: 7.2,
  });

  const [aiRisk] = useState<{ level: RiskLevel; confidence: number }>({
    level: "LOW RISK",
    confidence: 94,
  });

  const [geofence, setGeofence] = useState<GeofenceState>("Inside Home");
  const [wanderingAlert, setWanderingAlert] = useState<WanderingEvent | null>(null);

  const [alerts, setAlerts] = useState<AlertRecord[]>(() => generateAlertHistory());

  const [aiConfidence] = useState({ fallDetection: 98.3, wandering: 95.7 });

  const simulateFall = useCallback(() => {
    const time = nowTime();
    setFallDetected(true);
    setFallEvent({ severity: "High", time });
    setStatus("Emergency");
    setMotion("Fall Detected");
    setMotionConfidence(99);
    setAlerts((prev) => [
      {
        id: `alert-${Date.now()}`,
        time,
        timestamp: new Date(),
        event: "Fall",
        severity: "High",
        status: "Active",
      },
      ...prev,
    ]);
  }, []);

  const dismissFall = useCallback(() => {
    setFallDetected(false);
    setFallEvent(null);
    setEmergencyActive(false);
    setStatus("Safe at Home");
    setMotion("Sitting");
  }, []);

  const simulateWandering = useCallback(() => {
    const time = nowTime();
    setGeofence("Near Exit");
    setWanderingAlert({ time, confidence: 96, durationMinutes: 12 });
    setStatus("Emergency");
    setEmergencyActive(true);
    destinationRef.current = "Outside Home";
    pathRef.current = buildPath(positionRef.current, "Outside Home", roomFromPosition(positionRef.current));
    pathIndexRef.current = 0;
    pauseUntilRef.current = 0;
    setLocationHeading("Moving toward exit — possible wandering");
    setIsLocationMoving(true);
    setMotion("Walking");
    setAlerts((prev) => [
      {
        id: `alert-${Date.now()}`,
        time,
        timestamp: new Date(),
        event: "Wandering",
        severity: "Medium",
        status: "Active",
      },
      ...prev,
    ]);
  }, []);

  const dismissWandering = useCallback(() => {
    setWanderingAlert(null);
    setGeofence("Inside Home");
    setEmergencyActive(false);
    setStatus("Safe at Home");
    destinationRef.current = "Living Room";
    pathRef.current = buildPath(positionRef.current, "Living Room", "Outside Home");
    pathIndexRef.current = 0;
    pauseUntilRef.current = 0;
    setLocationHeading("Returning to Living Room");
    setIsLocationMoving(true);
    setMotion("Walking");
    setAlerts((prev) =>
      prev.map((a) =>
        a.event === "Wandering" && a.status === "Active" ? { ...a, status: "Resolved" } : a
      )
    );
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "Resolved" } : a)));
  }, []);

  const endEmergency = useCallback(() => {
    if (fallDetected) dismissFall();
    if (wanderingAlert) dismissWandering();
    setEmergencyActive(false);
  }, [fallDetected, wanderingAlert, dismissFall, dismissWandering]);

  useEffect(() => {
    if (fallDetected || wanderingAlert) setEmergencyActive(true);
  }, [fallDetected, wanderingAlert]);

  // Heart rate + vitals tick
  useEffect(() => {
    const id = setInterval(() => {
      setHeartRate((prev) => {
        const base = fallDetected ? prev + Math.random() * 6 : randomWalk(prev, 4, 58, 108);
        const next = Math.round(clamp(base, 55, 140));
        setHeartRateHistory((hist) => {
          const updated = [...hist.slice(1), { time: nowTime(), bpm: next }];
          return updated;
        });
        setHeartRateMin((m) => Math.min(m, next));
        setHeartRateMax((m) => Math.max(m, next));
        return next;
      });
      setSpo2((p) => Math.round(clamp(randomWalk(p, 1, 94, 99), 90, 100)));
      setTemperature((t) => Number(clamp(randomWalk(t, 0.15, 97.2, 99.2), 96, 101).toFixed(1)));
      setStress((s) => Math.round(clamp(randomWalk(s, 5, 10, 70), 0, 100)));
      setLastUpdated(new Date());
    }, 3000);
    return () => clearInterval(id);
  }, [fallDetected]);

  // Motion + accel/gyro tick
  useEffect(() => {
    const id = setInterval(() => {
      setAccel((prev) => {
        const amplitude = fallDetected ? 4.5 : motion === "Walking" ? 1.4 : motion === "Sleeping" ? 0.15 : 0.5;
        const last = prev[prev.length - 1];
        const next: AxisPoint = {
          time: nowTime(),
          x: Number(clamp(randomWalk(last.x, amplitude, -6, 6), -6, 6).toFixed(2)),
          y: Number(clamp(randomWalk(last.y, amplitude, -6, 6), -6, 6).toFixed(2)),
          z: Number(clamp(randomWalk(last.z, amplitude, -6, 6), -6, 6).toFixed(2)),
        };
        return [...prev.slice(1), next];
      });
      setGyro((prev) => {
        const amplitude = fallDetected ? 120 : motion === "Walking" ? 35 : motion === "Sleeping" ? 3 : 12;
        const last = prev[prev.length - 1];
        const next: AxisPoint = {
          time: nowTime(),
          x: Number(clamp(randomWalk(last.x, amplitude, -250, 250), -250, 250).toFixed(1)),
          y: Number(clamp(randomWalk(last.y, amplitude, -250, 250), -250, 250).toFixed(1)),
          z: Number(clamp(randomWalk(last.z, amplitude, -250, 250), -250, 250).toFixed(1)),
        };
        return [...prev.slice(1), next];
      });
    }, 800);
    return () => clearInterval(id);
  }, [motion, fallDetected]);

  // Live indoor location simulation (smooth movement between rooms)
  useEffect(() => {
    const TICK_MS = 80;

    const id = setInterval(() => {
      if (fallDetected) {
        setIsLocationMoving(false);
        setLocationHeading(null);
        return;
      }

      const now = Date.now();
      const currentRoom = roomFromPosition(positionRef.current);

      // Wandering: keep routing outside if alert active
      if (wanderingAlert && currentRoom !== "Outside Home") {
        if (pathRef.current.length === 0) {
          destinationRef.current = "Outside Home";
          pathRef.current = buildPath(positionRef.current, "Outside Home", currentRoom);
          pathIndexRef.current = 0;
          setLocationHeading("Patient leaving safe zone");
        }
      }

      if (now < pauseUntilRef.current) {
        setIsLocationMoving(false);
        return;
      }

      if (pathRef.current.length === 0 || pathIndexRef.current >= pathRef.current.length) {
        if (wanderingAlert) {
          pauseUntilRef.current = now + 2000;
          setIsLocationMoving(false);
          setMotion("Standing");
          return;
        }

        const nextRoom = pickNextRoom(currentRoom);
        destinationRef.current = nextRoom;
        pathRef.current = buildPath(positionRef.current, nextRoom, currentRoom);
        pathIndexRef.current = 0;
        setLocationHeading(`Walking to ${nextRoom}`);
        setIsLocationMoving(true);
        setMotion("Walking");
        setMotionConfidence(Math.round(92 + Math.random() * 7));
        setStatus("Walking");
      }

      const target = pathRef.current[pathIndexRef.current];
      const { position, arrived } = stepToward(positionRef.current, target, movementSpeed(true));

      positionRef.current = position;
      setPatientPosition({ ...position });

      trailTickRef.current += 1;
      if (trailTickRef.current % 3 === 0) {
        setLocationTrail((prev) => [...prev.slice(-60), { ...position }]);
      }

      const detectedRoom = roomFromPosition(position);
      setRoom((prev) => {
        if (prev !== detectedRoom) {
          setRoomHistory((h) => [...h.slice(-7), detectedRoom]);
          if (detectedRoom === "Outside Home") {
            setGeofence("Outside Home");
          } else if (position.y < 18 && position.y >= 12) {
            setGeofence("Near Exit");
          } else {
            setGeofence("Inside Home");
          }
        }
        return detectedRoom;
      });

      const nextRssi = rssiFromPosition(position) + Math.round((Math.random() - 0.5) * 2);
      setRssi(nextRssi);
      setWifiStatus(nextRssi > -55 ? "Connected" : nextRssi > -75 ? "Weak Signal" : "Disconnected");
      setLastUpdated(new Date());
      setIsLocationMoving(true);

      if (arrived) {
        pathIndexRef.current += 1;
        if (pathIndexRef.current >= pathRef.current.length) {
          pathRef.current = [];
          pathIndexRef.current = 0;
          pauseUntilRef.current = now + 2500 + Math.random() * 3500;
          setIsLocationMoving(false);
          setLocationHeading(null);
          const idleMotion: MotionState[] = ["Standing", "Sitting", "Sitting"];
          const idle = idleMotion[Math.floor(Math.random() * idleMotion.length)];
          setMotion(idle);
          setStatus(idle === "Sitting" || idle === "Standing" ? "Safe at Home" : "Walking");
        }
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, [fallDetected, wanderingAlert]);

  // Ambient motion confidence drift while stationary
  useEffect(() => {
    const id = setInterval(() => {
      if (fallDetected || wanderingAlert || isLocationMoving) return;
      if (Math.random() < 0.2) {
        setMotionConfidence(Math.round(88 + Math.random() * 11));
      }
    }, 8000);
    return () => clearInterval(id);
  }, [fallDetected, wanderingAlert, isLocationMoving]);

  // Steps ticking during the day
  useEffect(() => {
    const id = setInterval(() => {
      setActivity((prev) => ({
        ...prev,
        steps: prev.steps + (motion === "Walking" ? Math.floor(20 + Math.random() * 25) : 0),
        walkingMinutes: prev.walkingMinutes + (motion === "Walking" ? 1 : 0),
        sittingMinutes: prev.sittingMinutes + (motion === "Sitting" || motion === "Standing" ? 1 : 0),
      }));
    }, 5000);
    return () => clearInterval(id);
  }, [motion]);

  const value = useMemo<PatientDataContextValue>(
    () => ({
      patient: { ...patient, status, lastUpdated },
      status,
      wifiStatus,
      rssi,
      room,
      patientPosition,
      locationTrail,
      roomHistory,
      isLocationMoving,
      locationHeading,
      heartRate,
      heartRateHistory,
      heartRateMin,
      heartRateMax,
      spo2,
      temperature,
      stress,
      motion,
      motionConfidence,
      accel,
      gyro,
      fallDetected,
      fallEvent,
      activity,
      aiRisk,
      geofence,
      wanderingAlert,
      alerts,
      aiConfidence,
      emergencyActive,
      simulateFall,
      dismissFall,
      simulateWandering,
      dismissWandering,
      resolveAlert,
      endEmergency,
    }),
    [
      patient,
      status,
      lastUpdated,
      wifiStatus,
      rssi,
      room,
      patientPosition,
      locationTrail,
      roomHistory,
      isLocationMoving,
      locationHeading,
      heartRate,
      heartRateHistory,
      heartRateMin,
      heartRateMax,
      spo2,
      temperature,
      stress,
      motion,
      motionConfidence,
      accel,
      gyro,
      fallDetected,
      fallEvent,
      activity,
      aiRisk,
      geofence,
      wanderingAlert,
      alerts,
      aiConfidence,
      emergencyActive,
      simulateFall,
      dismissFall,
      simulateWandering,
      dismissWandering,
      resolveAlert,
      endEmergency,
    ]
  );

  return <PatientDataContext.Provider value={value}>{children}</PatientDataContext.Provider>;
}

export function usePatientData() {
  const ctx = useContext(PatientDataContext);
  if (!ctx) throw new Error("usePatientData must be used within PatientDataProvider");
  return ctx;
}
