import { GoogleGenAI } from "@google/genai";
import { aiGenerateBriefSchema } from "../src/schemas/ai.schema.js";

const sanitize = (val: any): string => {
  if (val === null || val === undefined) return "Not provided";
  const str = String(val);
  return str.slice(0, 500).trim();
};

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    aiGenerateBriefSchema.parse(body);
  } catch (zodError: any) {
    return Response.json({ error: "Validation failed", details: zodError.errors }, { status: 400 });
  }

  try {
    const { booking, studentContext, purchasedProducts } = body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }
    const ai = new GoogleGenAI({ apiKey });

    const userContext = `
    Student: ${sanitize(booking.user_name)}
    Session Time: ${sanitize(booking.time)} on ${sanitize(booking.date)}
    Base Context: ${sanitize(studentContext)}
    Assets Owned: ${purchasedProducts && Array.isArray(purchasedProducts) ? purchasedProducts.map(p => sanitize(p)).join(", ") : "None"}
    `.trim();

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate a brief for the following session context:\n\n${userContext}`,
      config: {
        systemInstruction: "You are an elite administrative assistant. Create a concise, professional pre-session brief for a mentor. Focus on suggested topics, how to integrate owned assets into the strategy, and potential goals for the call. Keep the tone elite and concise."
      }
    });

    return Response.json({ text: result.text });
  } catch (error: any) {
    console.error("AI Brief Error:", error);
    return Response.json({ error: "AI brief generation failed. Please try again later." }, { status: 500 });
  }
}
