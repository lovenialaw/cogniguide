export type PatientStatus = "Safe at Home" | "Walking" | "Sleeping" | "Emergency";

export type WifiStatus = "Connected" | "Weak Signal" | "Disconnected";

export type RoomName = "Living Room" | "Bedroom" | "Kitchen" | "Bathroom" | "Outside Home";

export type RiskLevel = "LOW RISK" | "MODERATE RISK" | "HIGH RISK";

export type MotionState = "Walking" | "Standing" | "Sitting" | "Sleeping" | "Fall Detected";

export type GeofenceState = "Inside Home" | "Near Exit" | "Outside Home";

export type Severity = "High" | "Medium" | "Low";

export type AlertStatus = "Active" | "Resolved" | "Dismissed";

export interface Patient {
  name: string;
  age: number;
  stage: string;
  status: PatientStatus;
  lastUpdated: Date;
  avatarInitials: string;
}

export interface HeartRatePoint {
  time: string;
  bpm: number;
}

export interface AxisPoint {
  time: string;
  x: number;
  y: number;
  z: number;
}

export interface ActivitySummary {
  steps: number;
  stepGoal: number;
  walkingMinutes: number;
  sittingMinutes: number;
  sleepHours: number;
}

export interface AlertRecord {
  id: string;
  time: string;
  timestamp: Date;
  event: "Fall" | "Left Home" | "Wandering" | "Low Battery" | "Irregular Heart Rate";
  severity: Severity;
  status: AlertStatus;
}

export interface FallFrequencyPoint {
  label: string;
  falls: number;
}

export type FallTrendDirection = "Increasing" | "Stable" | "Decreasing";

export interface FallTrendAssessment {
  direction: FallTrendDirection;
  recentTotal: number;
  priorTotal: number;
  recentRate: number;
  priorRate: number;
  percentChange: number | null;
  summary: string;
  recommendation: string;
  urgency: "none" | "low" | "moderate" | "high";
}

export interface ActivityRecognitionSlice {
  name: string;
  value: number;
  color: string;
}
