import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGeminiAI } from "./_lib/gemini.js";
import { applyCorsHeaders, getReportFallback, reportSchema } from "./_lib/helpers.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { logs, settings } = body;
  const fallbackReport = getReportFallback(body);

  try {
    const ai = getGeminiAI();
    if (!ai) {
      return res.status(200).json(fallbackReport);
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
      return res.status(200).json(fallbackReport);
    }

    return res.status(200).json(JSON.parse(text));
  } catch (_error) {
    return res.status(200).json(fallbackReport);
  }
}
