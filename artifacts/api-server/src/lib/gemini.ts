import { logger } from "./logger";

export interface GeminiQueryOptions {
  prompt: string;
  role?: "student" | "owner" | "super_admin";
  systemInstruction?: string;
  contextData?: any;
}

export async function generateGeminiReply(options: GeminiQueryOptions): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn("No GEMINI_API_KEY configured in environment variables");
    return null;
  }

  const roleTitle =
    options.role === "owner"
      ? "GHH Library Owner Business Copilot ('Ask GHH')"
      : options.role === "super_admin"
      ? "GHH Multi-Library Super-Admin AI Advisor"
      : "GHH Smart Library Student AI Coach";

  const defaultSystemInstruction = `You are the ${roleTitle} for GHH Library (Smart Library Manager).
You speak naturally in clear, supportive, bilingual Hindi & English (Hinglish/Hindi).
Your answers must be grounded strictly in the library database facts provided below.
Rules:
1. GHH Rule: 1 Credit = 1 Day / 1 Shift access.
2. Advance Leave Rule: If a student applies for leave in advance, their credit is protected and NOT deducted.
3. Always be helpful, concise, motivating for students, and data-driven for library owners.
4. If database context is provided, use exact numbers (credits, attendance, seat count, revenue).`;

  const systemPrompt = options.systemInstruction || defaultSystemInstruction;
  const contextBlock = options.contextData ? `\n\n[VERIFIED DATABASE CONTEXT]:\n${JSON.stringify(options.contextData, null, 2)}` : "";
  const fullPrompt = `${systemPrompt}${contextBlock}\n\n[USER QUERY]:\n${options.prompt}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: fullPrompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 800,
    },
  };

  const modelsToTry = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-1.5-flash"];

  for (const model of modelsToTry) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: any = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText && typeof replyText === "string") {
          logger.info({ model, role: options.role }, "Gemini AI reply generated successfully");
          return replyText.trim();
        }
      }
    } catch (err: any) {
      logger.warn({ model, err: err.message }, "Gemini attempt failed");
    }
  }

  logger.warn("All Gemini model attempts failed, using grounded fallback engine");
  return null;
}
