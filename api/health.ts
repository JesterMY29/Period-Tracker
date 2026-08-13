import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCorsHeaders } from "./_lib/helpers.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
}
