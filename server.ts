import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to initialize Gemini SDK safely
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Insights endpoint: Analyzes cycle data, phase, and logged symptoms
app.post("/api/insights", async (req, res) => {
  try {
    const { phase, cycleDay, symptoms, moods, flow, avgCycleLength, recentLogs } = req.body;

    const ai = getGeminiAI();
    if (!ai) {
      return res.json({
        phaseOverview: `You are currently in your ${phase} phase (Day ${cycleDay}). Focus on gentle rest, nutrient-dense meals, and listening to your body's energy levels.`,
        nutritionAdvice: [
          "Incorporate iron-rich foods like leafy greens, lean protein, and lentils.",
          "Stay well hydrated with herbal teas and warm water with lemon.",
          "Include magnesium-rich foods like dark chocolate, pumpkin seeds, and bananas to help ease muscle tension."
        ],
        exerciseAdvice: [
          "Choose low-impact activities like gentle yoga, stretching, or light walking.",
          "Listen to your body—rest when needed and avoid high-intensity strains if feeling fatigued."
        ],
        symptomAnalysis: symptoms && symptoms.length > 0 
          ? `You logged: ${symptoms.join(", ")}. These are common during the ${phase} phase. Warm compresses and hydration can help.`
          : "No major symptoms logged recently. Keeping consistent logs helps track subtle body patterns.",
        mindsetTip: "Give yourself grace during this phase. Emotional sensitivity and energy fluctuations are completely natural.",
        keyTakeaway: "Prioritize sleep, hydration, and restorative self-care today."
      });
    }

    const prompt = `
You are a empathetic, evidence-based reproductive health and cycle wellness expert for the "AuraCycle" app.
Analyze the user's current menstrual cycle status and logged symptoms:

- Current Phase: ${phase}
- Current Cycle Day: ${cycleDay} of ${avgCycleLength}-day cycle
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
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            phaseOverview: { type: Type.STRING },
            nutritionAdvice: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            exerciseAdvice: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            symptomAnalysis: { type: Type.STRING },
            mindsetTip: { type: Type.STRING },
            keyTakeaway: { type: Type.STRING },
          },
          required: [
            "phaseOverview",
            "nutritionAdvice",
            "exerciseAdvice",
            "symptomAnalysis",
            "mindsetTip",
            "keyTakeaway",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini");
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/insights:", error);
    return res.status(500).json({
      error: "Failed to generate AI insights.",
      message: error.message,
    });
  }
});

// AI Chat Consultation endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { question, currentContext, history } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required." });
    }

    const ai = getGeminiAI();
    if (!ai) {
      return res.json({
        answer: `Thank you for asking: "${question}". \n\nDuring your ${currentContext?.phase || "cycle"}, hormonal shifts significantly impact energy, mood, and physical symptoms. Staying hydrated, eating balanced whole foods, and tracking symptoms regularly will provide valuable insights over time. (Note: For medical concerns, please consult a qualified healthcare professional.)`
      });
    }

    const systemInstruction = `
You are Aura, an empathetic, supportive, and knowledgeable Women's Cycle & Hormonal Health Specialist within the AuraCycle app.
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
      answer: response.text || "I'm here to support your cycle health journey. How else can I assist you today?",
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({
      error: "Failed to generate chat response.",
      message: error.message,
    });
  }
});

// AI Cycle Health Summary Report Endpoint
app.post("/api/report", async (req, res) => {
  try {
    const { logs, settings, userProfile } = req.body;

    const ai = getGeminiAI();
    if (!ai) {
      return res.json({
        summary: "Over the recorded period, your cycles show consistent tracking. Regular logging of symptoms, flow, and BBT provides a clear baseline of your reproductive health.",
        cycleRegularityAssessment: "Your cycle appears generally within expected standard ranges (26-32 days).",
        commonSymptomsObserved: ["Cramps", "Bloating", "Fatigue"],
        physicianNotes: "Share this log summary with your gynaecologist or healthcare provider during routine check-ups.",
        lifestyleRecommendations: ["Maintain consistent sleep schedule during luteal phase", "Increase magnesium intake 5 days prior to period start"]
      });
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
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            cycleRegularityAssessment: { type: Type.STRING },
            commonSymptomsObserved: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            physicianNotes: { type: Type.STRING },
            lifestyleRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "summary",
            "cycleRegularityAssessment",
            "commonSymptomsObserved",
            "physicianNotes",
            "lifestyleRecommendations",
          ],
        },
      },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/report:", error);
    return res.status(500).json({ error: "Failed to generate report." });
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
