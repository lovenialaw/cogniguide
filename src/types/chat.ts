export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
}

export interface PatientChatContext {
  patientName: string;
  age: number;
  stage: string;
  status: string;
  room: string;
  geofence: string;
  heartRate: number;
  heartRateMin: number;
  heartRateMax: number;
  spo2: number;
  temperature: number;
  stress: number;
  motion: string;
  motionConfidence: number;
  steps: number;
  stepGoal: number;
  sleepHours: number;
  aiRisk: string;
  aiRiskConfidence: number;
  fallDetected: boolean;
  fallEventTime: string | null;
  wanderingActive: boolean;
  totalFalls: number;
  fallTrend: string;
  fallTrendSummary: string;
  fallRecommendation: string;
  recentAlerts: string;
  recentFalls: string;
  activeAlerts: number;
}
