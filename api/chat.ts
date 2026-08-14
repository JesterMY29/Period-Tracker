import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGeminiAI } from "./_lib/gemini.js";
import { applyCorsHeaders, getFallbackChatAnswer } from "./_lib/helpers.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { question, currentContext, history } = body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Question is required." });
  }

  try {
    console.log('[AI CHAT DEBUG] Initializing Gemini client');
    const ai = getGeminiAI();
    console.log('[AI CHAT DEBUG] Gemini client:', ai ? 'initialized' : 'NULL');
    if (!ai) {
      return res.status(200).json({
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

    console.log('[AI CHAT DEBUG] Calling Gemini generateContent');
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction,
      },
    });
    console.log('[AI CHAT DEBUG] Gemini generateContent succeeded');

    return res.status(200).json({
      answer: response.text || getFallbackChatAnswer(question, currentContext),
    });
  } catch (error: any) {
    console.error('[AI CHAT DEBUG] Gemini generateContent failed');
    console.error('[AI CHAT DEBUG] Error name:', error?.name);
    console.error('[AI CHAT DEBUG] Error status:', error?.status);
    console.error('[AI CHAT DEBUG] Error message:', error?.message);
    console.error('[AI CHAT DEBUG] Error statusText:', error?.statusText);
    console.error('[AI CHAT DEBUG] Error cause:', error?.cause);
    console.error('[AI CHAT DEBUG] Error error:', error?.error);
    console.error('[AI CHAT DEBUG] Error response:', error?.response);
    try {
      console.error('[AI CHAT DEBUG] Error serialized:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } catch (_e) {
      console.error('[AI CHAT DEBUG] Could not serialize error object');
    }
    return res.status(500).json({
      error: 'Gemini request failed',
      debug: true,
    });
  }
}
