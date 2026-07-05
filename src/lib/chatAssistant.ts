import { assessFallTrend, countTotalFalls } from "@/lib/fallAnalytics";
import type { PatientChatContext } from "@/types/chat";
import type { PatientDataContextValue } from "@/context/PatientDataContext";

type ChatHistoryItem = { role: "user" | "assistant"; content: string };

export function buildPatientChatContext(data: PatientDataContextValue): PatientChatContext {
  const trend = assessFallTrend(data.alerts);
  const recentFalls = data.alerts
    .filter((a) => a.event === "Fall")
    .slice(0, 3)
    .map((a) => `${a.time} (${a.severity})`)
    .join("; ");

  const recentAlerts = data.alerts
    .slice(0, 4)
    .map((a) => `${a.time}: ${a.event} — ${a.severity} (${a.status})`)
    .join("\n");

  return {
    patientName: data.patient.name,
    age: data.patient.age,
    stage: data.patient.stage,
    status: data.status,
    room: data.room,
    geofence: data.geofence,
    heartRate: data.heartRate,
    heartRateMin: data.heartRateMin,
    heartRateMax: data.heartRateMax,
    spo2: data.spo2,
    temperature: data.temperature,
    stress: data.stress,
    motion: data.motion,
    motionConfidence: data.motionConfidence,
    steps: data.activity.steps,
    stepGoal: data.activity.stepGoal,
    sleepHours: data.activity.sleepHours,
    aiRisk: data.aiRisk.level,
    aiRiskConfidence: data.aiRisk.confidence,
    fallDetected: data.fallDetected,
    fallEventTime: data.fallEvent?.time ?? null,
    wanderingActive: !!data.wanderingAlert,
    totalFalls: countTotalFalls(data.alerts),
    fallTrend: trend.direction,
    fallTrendSummary: trend.summary,
    fallRecommendation: trend.recommendation,
    recentAlerts: recentAlerts || "No recent alerts.",
    recentFalls: recentFalls || "None in recent history.",
    activeAlerts: data.alerts.filter((a) => a.status === "Active").length,
  };
}

function buildSystemPrompt(ctx: PatientChatContext): string {
  return `You are COGNIGUIDE Assistant, a compassionate AI caregiver support chatbot for family members monitoring Alzheimer's patients via a smartwatch dashboard.

Patient snapshot (live):
${JSON.stringify(ctx, null, 2)}

Guidelines:
- Be warm, clear, and reassuring but direct about health risks.
- Use the patient snapshot data when answering — do not invent vitals or events.
- If fall trend is Increasing, emphasize early medical consultation.
- For emergencies (active fall, wandering), prioritize immediate action steps.
- Keep responses concise (2–4 short paragraphs max) unless the caregiver asks for detail.
- You are not a doctor; recommend professional care when appropriate.`;
}

function matches(input: string, patterns: string[]): boolean {
  return patterns.some((p) => input.includes(p));
}

export function generateLocalResponse(query: string, ctx: PatientChatContext): string {
  const q = query.toLowerCase().trim();

  if (matches(q, ["hello", "hi", "hey", "help me", "start"])) {
    return `Hello! I'm your COGNIGUIDE Assistant. I can help you understand **${ctx.patientName}'s** current status, vitals, location, fall history, and trends.

Try asking:
• "How is ${ctx.patientName.split(" ")[0]} doing right now?"
• "Summarize her vitals"
• "What's the fall trend?"
• "Any active alerts?"`;
  }

  if (matches(q, ["emergency", "fall detected", "what should i do", "urgent", "911"])) {
    if (ctx.fallDetected) {
      return `**Active emergency — fall detected** at ${ctx.fallEventTime ?? "just now"}.

Recommended steps:
1. Call ${ctx.patientName} immediately via the Emergency page.
2. Check her last known location: **${ctx.room}**.
3. Current heart rate: **${ctx.heartRate} BPM** — elevated stress is common after a fall.
4. If unresponsive, call emergency services and open maps to her location.

Use the **Emergency** page in the sidebar for one-tap calling options.`;
    }
    return `No active emergency right now. ${ctx.patientName} is **${ctx.status}** in the **${ctx.room}**.

If a fall occurs: go to **Live Monitoring** or **Emergency**, call the patient first, then caregivers or emergency services if needed.`;
  }

  if (matches(q, ["fall trend", "trend", "decline", "deterioration", "mobility", "getting worse"])) {
    return `**Fall trend analysis:** ${ctx.fallTrend}

${ctx.fallTrendSummary}

**Recommendation:** ${ctx.fallRecommendation}

Total falls logged: **${ctx.totalFalls}**. Tracking this over time helps detect accelerating physical or cognitive decline — early intervention can slow progression before late-stage mobility loss.`;
  }

  if (matches(q, ["fall", "fell", "falling"])) {
    if (ctx.fallDetected) {
      return `⚠️ **Fall detected now** (${ctx.fallEventTime}). Heart rate: ${ctx.heartRate} BPM. Go to the Emergency page immediately.`;
    }
    return `**Fall status:** No active fall. Total logged falls: **${ctx.totalFalls}**.

Recent falls: ${ctx.recentFalls}

Trend: **${ctx.fallTrend}** — ${ctx.fallTrendSummary}`;
  }

  if (matches(q, ["vital", "heart", "bpm", "oxygen", "spo2", "temperature", "stress", "pulse"])) {
    const hrStatus = ctx.heartRate >= 60 && ctx.heartRate <= 100 ? "within normal range" : "outside typical resting range";
    return `**Vital signs for ${ctx.patientName}:**

• **Heart rate:** ${ctx.heartRate} BPM (${hrStatus}) — today: ${ctx.heartRateMin}–${ctx.heartRateMax} BPM
• **Blood oxygen (SpO₂):** ${ctx.spo2}%
• **Temperature:** ${ctx.temperature}°F
• **Stress level:** ${ctx.stress}/100

Continuous heart rate monitoring helps detect anomalies early. ${ctx.heartRate > 100 ? "Her heart rate is elevated — consider observation and notifying her care provider if it persists." : "Readings appear stable at this time."}`;
  }

  if (matches(q, ["location", "where", "room", "wandering", "geofence", "home", "outside"])) {
    if (ctx.wanderingActive) {
      return `⚠️ **Possible wandering detected.** ${ctx.patientName} is flagged as **${ctx.geofence}** (last room: ${ctx.room}).

Use the Location page to view the map, call the patient, or notify other caregivers.`;
    }
    return `**Location:** ${ctx.patientName} is in the **${ctx.room}** (${ctx.geofence}).

Wi-Fi positioning shows she is within the home safe zone. Last motion: **${ctx.motion}** (${ctx.motionConfidence}% confidence).`;
  }

  if (matches(q, ["activity", "steps", "walking", "sleep", "moving"])) {
    const stepPct = Math.round((ctx.steps / ctx.stepGoal) * 100);
    return `**Today's activity:**

• **Steps:** ${ctx.steps.toLocaleString()} / ${ctx.stepGoal.toLocaleString()} (${stepPct}% of goal)
• **Current motion:** ${ctx.motion}
• **Sleep (last night):** ${ctx.sleepHours} hours

Regular movement supports cognitive and physical health. Low activity over time may warrant a clinical review.`;
  }

  if (matches(q, ["alert", "notification", "history", "event"])) {
    return `**Alerts:** ${ctx.activeAlerts} active alert(s).

Recent events:
${ctx.recentAlerts}`;
  }

  if (matches(q, ["risk", "overall", "how is", "how's", "status", "doing", "summary", "overview"])) {
    const urgent = ctx.fallDetected || ctx.wanderingActive;
    return `${urgent ? "⚠️ **Attention needed.**\n\n" : ""}**${ctx.patientName}** (${ctx.age}, ${ctx.stage})

• **Status:** ${ctx.status}
• **Location:** ${ctx.room} (${ctx.geofence})
• **AI overall risk:** ${ctx.aiRisk} (${ctx.aiRiskConfidence}% confidence)
• **Heart rate:** ${ctx.heartRate} BPM
• **Fall trend:** ${ctx.fallTrend} (${ctx.totalFalls} total logged)

${ctx.fallTrend === "Increasing" ? "📈 Fall frequency is rising — consider scheduling a medical consultation." : "Monitoring continues. Ask me about vitals, falls, or location anytime."}`;
  }

  return `I'm here to help with **${ctx.patientName}'s** care data. I can answer questions about:

• Current status and location
• Vital signs (heart rate, SpO₂, temperature)
• Fall history and trends
• Recent alerts
• Emergency guidance

What would you like to know?`;
}

export async function askAssistant(
  userMessage: string,
  history: ChatHistoryItem[],
  patientData: PatientDataContextValue
): Promise<string> {
  const ctx = buildPatientChatContext(patientData);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

  if (apiKey?.trim()) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.4,
          max_tokens: 600,
          messages: [
            { role: "system", content: buildSystemPrompt(ctx) },
            ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
        }),
      });

      if (response.ok) {
        const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
        const text = json.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch {
      // fall through to local assistant
    }
  }

  return generateLocalResponse(userMessage, ctx);
}
