import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGeminiAI } from "./_lib/gemini.js";
import { applyCorsHeaders, getTipFallback, tipSchema } from "./_lib/helpers.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { phase, cycleDay, symptoms, moods } = body;
  const fallbackTip = getTipFallback(body);

  try {
    const ai = getGeminiAI();
    if (!ai) {
      return res.status(200).json(fallbackTip);
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
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: tipSchema,
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(200).json(fallbackTip);
    }

    return res.status(200).json(JSON.parse(text));
  } catch (_error) {
    return res.status(200).json(fallbackTip);
  }
}
