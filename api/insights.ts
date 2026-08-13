import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGeminiAI } from "./_lib/gemini.js";
import { applyCorsHeaders, getInsightsFallback, insightsSchema } from "./_lib/helpers.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { phase, cycleDay, symptoms, moods, flow, avgCycleLength, recentLogs } = body;

  const currentPhaseStr = phase || "Follicular";
  const currentDayNum = cycleDay || 1;

  const fallbackInsights = getInsightsFallback(body);

  try {
    const ai = getGeminiAI();
    if (!ai) {
      return res.status(200).json(fallbackInsights);
    }

    const prompt = `
You are a empathetic, evidence-based reproductive health and cycle wellness expert for the "AuraCycle" app.
Analyze the user's current menstrual cycle status and logged symptoms:

- Current Phase: ${currentPhaseStr}
- Current Cycle Day: ${currentDayNum} of ${avgCycleLength || 28}-day cycle
- Today's Logged Flow: ${flow || "None"}
- Today's Symptoms: ${symptoms?.length ? symptoms.join(", ") : "None reported today"}
- Today's Moods: ${moods?.length ? moods.join(", ") : "None reported today"}
- Recent Cycle History Summary: ${JSON.stringify(recentLogs || [])}

Provide detailed, practical, encouraging, and science-backed health insights.
Respond ONLY in valid JSON matching this schema:
{
  "phaseOverview": "A warm 2-3 sentence overview of what happens hormonally during this phase and how it affects body/mind.",
  "nutritionAdvice": ["3 bullet points tailored to this phase and logged symptoms"],
  "exerciseAdvice": ["2-3 bullet points on optimal movement, workouts, or energy pacing"],
  "symptomAnalysis": "A short paragraph analyzing reported symptoms in relation to hormonal shifts, offering natural comfort remedies.",
  "mindsetTip": "A mindfulness/mental wellness tip for today.",
  "keyTakeaway": "A single inspiring, actionable sentence summary."
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: insightsSchema,
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(200).json(fallbackInsights);
    }

    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (_error) {
    return res.status(200).json(fallbackInsights);
  }
}
