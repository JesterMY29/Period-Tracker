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

// AI Tip of the Day endpoint: Generates 1 actionable wellness tip based on cycle phase & symptoms
app.post("/api/tip", async (req, res) => {
  const { phase, cycleDay, symptoms, moods } = req.body;

  const defaultTips: Record<string, { category: string; title: string; tip: string; action: string }> = {
    Menstrual: {
      category: "REST & RECOVERY",
      title: "Warmth & Iron Replenishment",
      tip: "Hormone levels are at their monthly baseline. Blood loss makes iron and hydration vital for sustained energy.",
      action: "Sip warm ginger tea and incorporate dark leafy greens or lentils into your meals today."
    },
    Follicular: {
      category: "NUTRITION & VITALITY",
      title: "Gut Support for Rising Estrogen",
      tip: "Estrogen is steadily climbing, firing up your metabolic stamina and mental sharpness.",
      action: "Add fermented foods like kimchi or Greek yogurt to support healthy estrogen metabolism."
    },
    Ovulatory: {
      category: "MOVEMENT & ENERGY",
      title: "Capitalize on Peak Confidence",
      tip: "Estrogen and LH reach peak concentration today, providing maximum physical stamina and social power.",
      action: "Schedule a high-intensity workout, creative brainstorm, or social event to ride this natural wave!"
    },
    Luteal: {
      category: "MAGNESIUM & MOOD",
      title: "Magnesium for PMS Relief",
      tip: "Progesterone dominates while serotonin dips, which can lead to mild bloating or mood shifts.",
      action: "Enjoy pumpkin seeds or dark chocolate (70%+) with an evening magnesium-rich soak."
    }
  };

  const phaseKey = (phase && defaultTips[phase]) ? phase : "Follicular";
  const fallbackTip = { ...defaultTips[phaseKey] };

  if (symptoms && Array.isArray(symptoms) && symptoms.some((s: string) => s.toLowerCase().includes("cramp"))) {
    fallbackTip.category = "COMFORT & RECOVERY";
    fallbackTip.title = "Heat & Pelvic Muscle Relief";
    fallbackTip.action = "Apply a warm heating pad to your lower abdomen and practice gentle child's pose stretching.";
  }

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
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            title: { type: Type.STRING },
            tip: { type: Type.STRING },
            action: { type: Type.STRING },
          },
          required: ["category", "title", "tip", "action"],
        },
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

// AI Insights endpoint: Analyzes cycle data, phase, and logged symptoms
app.post("/api/insights", async (req, res) => {
  const { phase, cycleDay, symptoms, moods, flow, avgCycleLength, recentLogs } = req.body;

  const currentPhaseStr = phase || "Follicular";
  const currentDayNum = cycleDay || 1;

  const phaseOverviews: Record<string, string> = {
    Menstrual: `During your Menstrual phase (Day ${currentDayNum}), estrogen and progesterone are at baseline levels. Your body sheds the endometrial lining, requiring gentle rest, hydration, and iron-dense nourishment.`,
    Follicular: `During your Follicular phase (Day ${currentDayNum}), rising estrogen levels stimulate follicle maturation, delivering a noticeable uptick in brain focus, skin vitality, and physical stamina.`,
    Ovulatory: `During your Ovulatory phase (Day ${currentDayNum}), peak estrogen and a surge of LH trigger egg release, creating a window of maximum natural confidence, endurance, and social energy.`,
    Luteal: `During your Luteal phase (Day ${currentDayNum}), progesterone takes center stage to nurture the uterine lining. Metabolism slightly accelerates, making steady blood sugar management essential for mood stability.`
  };

  const nutritionByPhase: Record<string, string[]> = {
    Menstrual: [
      "Prioritize iron-rich foods: spinach, dark chocolate, lentils, and clean proteins.",
      "Warm, easily digestible broths and soups comfort digestive sensitivity.",
      "Pair foods with Vitamin C (citrus, berries) to maximize iron absorption."
    ],
    Follicular: [
      "Focus on sprouted seeds, fermented foods (kimchi, kefir), and vibrant green vegetables.",
      "Incorporate lean proteins and avocado healthy fats to support building follicle tissue.",
      "Stay hydrated with fresh water and antioxidant-rich green tea."
    ],
    Ovulatory: [
      "Eat fiber-rich veggies like broccoli and Brussels sprouts to help liver process surplus estrogen.",
      "Enjoy berry antioxidant smoothies and light, energetic protein bowls.",
      "Incorporate hydrating cucumbers, melons, and fresh herbs."
    ],
    Luteal: [
      "Consume complex carbs (sweet potatoes, oats, quinoa) to maintain stable serotonin levels.",
      "Incorporate magnesium-rich foods (dark chocolate, pumpkin seeds, almonds) to ease cramping.",
      "Limit excess refined sugar and caffeine to mitigate PMS mood fluctuations."
    ]
  };

  const exerciseByPhase: Record<string, string[]> = {
    Menstrual: [
      "Prioritize gentle movement like yin yoga, pelvic stretches, or light 15-minute walks.",
      "Avoid high-intensity strains or heavy lifting if experiencing active cramping."
    ],
    Follicular: [
      "Great time to try new workouts, dance cardio, or progressive strength training.",
      "Capitalize on rising stamina and faster muscle recovery times."
    ],
    Ovulatory: [
      "Engage in high-intensity interval training (HIIT), group cycling, or heavy lifting.",
      "Your physical energy and pain tolerance are at peak monthly levels."
    ],
    Luteal: [
      "Shift toward low-impact movement: Pilates, swimming, resistance bands, or nature hikes.",
      "Listen closely to your body—taper intensity if fatigue sets in."
    ]
  };

  const fallbackInsights = {
    phaseOverview: phaseOverviews[currentPhaseStr] || phaseOverviews.Follicular,
    nutritionAdvice: nutritionByPhase[currentPhaseStr] || nutritionByPhase.Follicular,
    exerciseAdvice: exerciseByPhase[currentPhaseStr] || exerciseByPhase.Follicular,
    symptomAnalysis: symptoms && symptoms.length > 0
      ? `You logged: ${symptoms.join(", ")}. These are common during the ${currentPhaseStr} phase. Applying localized warmth, staying hydrated, and eating anti-inflammatory foods provide natural comfort.`
      : "No major symptoms logged recently. Consistent tracking helps reveal your body's unique monthly rhythm.",
    mindsetTip: "Give yourself grace today. Emotional sensitivity and energy fluctuations are natural reflections of hormonal balance.",
    keyTakeaway: "Prioritize restorative rest, balanced hydration, and nutrient-dense meals today."
  };

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
      return res.json(fallbackInsights);
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (_error) {
    return res.json(fallbackInsights);
  }
});

// Helper function to generate tailored chat response when Gemini API is rate-limited or unavailable
function getFallbackChatAnswer(question: string, currentContext: any): string {
  const q = question.toLowerCase();
  const phase = currentContext?.phase || "cycle";
  const day = currentContext?.cycleDay || 1;

  if (q.includes("cramp") || q.includes("pain") || q.includes("hurt") || q.includes("activity") || q.includes("activities")) {
    return `Here are effective activities and remedies to help manage period cramps during your ${phase} phase (Day ${day}):\n\n` +
      `1. Localized Heat Therapy: Apply a heating pad or hot water bottle to your lower abdomen or lower back to relax uterine muscle contractions.\n` +
      `2. Gentle Restorative Yoga & Pelvic Stretches: Positions like Child's Pose, Cat-Cow, and Reclined Bound Angle relieve pelvic tension without straining your body.\n` +
      `3. Anti-Inflammatory Herbal Teas: Sip warm ginger, chamomile, or peppermint tea. Ginger has natural anti-inflammatory compounds that soothe cramping.\n` +
      `4. Magnesium & Hydration: Drink warm water and eat magnesium-rich foods like dark chocolate (70%+), pumpkin seeds, or bananas to aid muscle relaxation.\n` +
      `5. Gentle Walking: A slow 10-15 minute walk stimulates natural endorphin release, acting as a natural pain reducer.\n\n` +
      `Note: If cramps are severe or unmanageable, please consult a healthcare professional.`;
  }
  if (q.includes("craving") || q.includes("sugar") || q.includes("food") || q.includes("eat") || q.includes("nutrition")) {
    return `Managing appetite and cravings during your ${phase} phase (Day ${day}):\n\n` +
      `1. Balance Blood Sugar: Combine complex carbs (sweet potatoes, oats, quinoa) with protein and healthy fats to avoid insulin spikes.\n` +
      `2. Dark Chocolate Comfort: Dark chocolate (70%+ cacao) supplies magnesium and satisfies sweet cravings while supporting serotonin production.\n` +
      `3. Magnesium-Rich Snacks: Pumpkin seeds, almonds, and walnuts curb chocolate and savory cravings naturally.\n` +
      `4. Hydration First: Dehydration often feels like hunger—sip warm herbal tea or lemon water when cravings arise.`;
  }
  if (q.includes("workout") || q.includes("exercise") || q.includes("train") || q.includes("gym") || q.includes("movement")) {
    return `Optimal movement guidelines for your ${phase} phase (Day ${day}):\n\n` +
      `• Menstrual Phase: Gentle walking, restorative yin yoga, stretching, and rest.\n` +
      `• Follicular Phase: Dance cardio, moderate strength training, and new workouts as stamina rises.\n` +
      `• Ovulatory Phase: High-intensity interval training (HIIT), heavy lifting, and social fitness at peak energy.\n` +
      `• Luteal Phase: Pilates, barre, steady swimming, and resistance bands as progesterone rises.\n\n` +
      `Listen to your body and adjust intensity according to your daily energy levels.`;
  }
  if (q.includes("sleep") || q.includes("tired") || q.includes("fatigue") || q.includes("insomnia")) {
    return `Improving sleeps quality during your ${phase} phase (Day ${day}):\n\n` +
      `1. Cooling Environment: Progesterone elevates core body temperature in the luteal phase—keep your bedroom cool (65-68°F / 18-20°C).\n` +
      `2. Magnesium Evening Soak: Try a warm bath with Epsom salts or enjoy magnesium-rich evening snacks to promote muscle relaxation.\n` +
      `3. Screen Cut-Off: Limit blue light 1 hour before bed and practice 4-7-8 deep diaphragmatic breathing.\n` +
      `4. Morning Sunlight: Get 10-15 minutes of natural sunlight after waking up to reinforce your circadian rhythm.`;
  }
  return `Thank you for asking about "${question}".\n\nDuring your ${phase} phase (Day ${day}), your hormonal balance influences energy, metabolism, and mood. Prioritizing balanced nutrition, steady hydration, anti-inflammatory whole foods, and restorative sleep will help keep your cycle supported.\n\nHow else can I assist you today?`;
}

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

  const fallbackReport = {
    summary: "Over the tracked period, your cycle data reflects steady logging. Consistent tracking of symptoms, flow intensity, and moods provides a reliable baseline for monitoring hormonal health.",
    cycleRegularityAssessment: `Your cycle duration is estimated at ${settings?.avgCycleLength || 28} days, with average period duration of ${settings?.avgPeriodLength || 5} days, consistent with standard healthy physiological ranges.`,
    commonSymptomsObserved: ["Cramps", "Bloating", "Fatigue", "Mood Shift"],
    physicianNotes: "Share this log summary with your gynaecologist or primary care physician during routine wellness visits to discuss symptom timing and hormonal phase alignment.",
    lifestyleRecommendations: [
      "Maintain a consistent sleep schedule, especially during the luteal phase.",
      "Increase dietary magnesium and omega-3 intake 5 days prior to expected period start.",
      "Track daily hydration (aim for 64-80 oz water daily) to reduce bloating and fatigue."
    ]
  };

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
