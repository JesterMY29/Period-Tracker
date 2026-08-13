import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { getGeminiAI } from "./api/_lib/gemini.js";
import {
  getTipFallback,
  tipSchema,
  getInsightsFallback,
  insightsSchema,
  getFallbackChatAnswer,
  getReportFallback,
  reportSchema,
} from "./api/_lib/helpers.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Tip of the Day endpoint
app.post("/api/tip", async (req, res) => {
  const { phase, cycleDay, symptoms, moods } = req.body;
  const fallbackTip = getTipFallback(req.body);

  try {
    const ai = getGeminiAI();
    if (!ai) {
      return res.json(fallbackTip);
    }

    const prompt = `
You are a top women's health and hormonal cycle specialist for the "AuraCycle" app.
Generate ONE highly actionable, science-informed "Tip of the Day" tailored to the user's current cycle phase:

- Current Phase: ${phase || "Follicular"}
- Current Cycle Day: Day ${cycleDay || 1}
- Logged Symptoms Today: ${symptoms?.length ? symptoms.join(", ") : "None reported"}
- Logged Moods Today: ${moods?.length ? moods.join(", ") : "None reported"}

Requirements:
1. Provide a clear category (e.g. "NUTRITION", "MOVEMENT", "MINDSET", "RECOVERY", "HYDRATION").
2. Write a short, engaging title.
3. Provide a 1-2 sentence tip explaining the physiological rationale.
4. Give 1 immediate, realistic, actionable step the user can take today.

Respond ONLY in valid JSON matching this schema:
{
  "category": "CATEGORY_NAME",
  "title": "Punchy Title",
  "tip": "Explanation of phase physiology and tip reasoning.",
  "action": "Single actionable step for today."
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: tipSchema,
      },
    });

    const text = response.text;
    if (!text) {
      return res.json(fallbackTip);
    }

    return res.json(JSON.parse(text));
  } catch (_error) {
    return res.json(fallbackTip);
  }
});

// AI Insights endpoint
app.post("/api/insights", async (req, res) => {
  const { phase, cycleDay, symptoms, moods, flow, avgCycleLength, recentLogs } = req.body;

  const currentPhaseStr = phase || "Follicular";
  const currentDayNum = cycleDay || 1;
  const fallbackInsights = getInsightsFallback(req.body);

  try {
    const ai = getGeminiAI();
    if (!ai) {
      return res.json(fallbackInsights);
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
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: insightsSchema,
      },
    });

    const text = response.text;
    if (!text) {
      return res.json(fallbackInsights);
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (_error) {
    return res.json(fallbackInsights);
  }
});

// AI Chat Consultation endpoint
app.post("/api/chat", async (req, res) => {
  const { question, currentContext, history } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Question is required." });
  }

  try {
    const ai = getGeminiAI();
    if (!ai) {
      return res.json({
        answer: getFallbackChatAnswer(question, currentContext),
      });
    }

    const systemInstruction = `
You are Jester, an empathetic, supportive, and knowledgeable Women's Cycle & Hormonal Health Specialist within the AuraCycle app.
You provide holistic, science-informed, compassionate advice on period health, cycle phases (Menstrual, Follicular, Ovulatory, Luteal), PMS, nutrition, fertility awareness, mood changes, and sleep hygiene.

Context about the user asking:
- Phase: ${currentContext?.phase || "Unknown"}
- Cycle Day: Day ${currentContext?.cycleDay || "Unknown"}
- Average Cycle Length: ${currentContext?.avgCycleLength || 28} days

Guidelines:
- Keep answers encouraging, respectful, clear, and easy to read with bullet points or short paragraphs.
- Always include a gentle disclaimer if answering specific medical/pathological concerns, emphasizing that you are an AI guide and not a substitute for clinical advice.
- Focus on practical self-care, lifestyle adjustments, hormonal physiology, and tracking tips.
`;

    const chatContents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        chatContents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }
    chatContents.push({
      role: "user",
      parts: [{ text: question }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      answer: response.text || getFallbackChatAnswer(question, currentContext),
    });
  } catch (_error) {
    return res.json({
      answer: getFallbackChatAnswer(question, currentContext),
    });
  }
});

// AI Cycle Health Summary Report Endpoint
app.post("/api/report", async (req, res) => {
  const { logs, settings } = req.body;
  const fallbackReport = getReportFallback(req.body);

  try {
    const ai = getGeminiAI();
    if (!ai) {
      return res.json(fallbackReport);
    }

    const prompt = `
Create a comprehensive, structured Cycle Health Summary Report for a user based on their tracked log data:
Logged History: ${JSON.stringify(logs || [])}
Cycle Settings: Average Length = ${settings?.avgCycleLength || 28} days, Period Length = ${settings?.avgPeriodLength || 5} days.

Respond ONLY in valid JSON matching this schema:
{
  "summary": "Executive summary of the user's menstrual health pattern over the tracked months.",
  "cycleRegularityAssessment": "Assessment of cycle regularity and duration trends.",
  "commonSymptomsObserved": ["Array of top 3-5 symptoms most frequently logged and when they typically occur"],
  "physicianNotes": "Key observations structured for discussion with a doctor or gynaecologist.",
  "lifestyleRecommendations": ["3-4 tailored holistic recommendations for lifestyle, diet, and recovery"]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
      },
    });

    const text = response.text;
    if (!text) {
      return res.json(fallbackReport);
    }

    return res.json(JSON.parse(text));
  } catch (_error) {
    return res.json(fallbackReport);
  }
});

// Setup Vite / Static handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AuraCycle server running on http://localhost:${PORT}`);
  });
}

startServer();
