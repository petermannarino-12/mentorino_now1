import { Handler } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";
import { aiGenerateBriefSchema } from "../../src/schemas/ai.schema.js";

const sanitize = (val: any): string => {
  if (val === null || val === undefined) return "Not provided";
  const str = String(val);
  return str.slice(0, 500).trim();
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body: any;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }
  try {
    aiGenerateBriefSchema.parse(body);
  } catch (zodError: any) {
    return { statusCode: 400, body: JSON.stringify({ error: "Validation failed", details: zodError.errors }) };
  }

  try {
    const { booking, studentContext, purchasedProducts } = body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "GEMINI_API_KEY is not configured" }) };
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

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: result.text }),
    };
  } catch (error: any) {
    console.error("AI Brief Error:", error);
    return { 
      statusCode: 500, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "AI brief generation failed. Please try again later." }) 
    };
  }
};
