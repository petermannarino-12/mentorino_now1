import { Handler } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { aiAnalyzeApplicationSchema } from "../../src/schemas/ai.schema.js";

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
    aiAnalyzeApplicationSchema.parse(body);
  } catch (zodError: any) {
    return { statusCode: 400, body: JSON.stringify({ error: "Validation failed", details: zodError.errors }) };
  }

  try {
    const { application } = body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "GEMINI_API_KEY is not configured" }) };
    }
    const ai = new GoogleGenAI({ apiKey });

    const userContext = `
    Applicant: ${sanitize(application.user_name)}
    Mentor Type requested: ${sanitize(application.mentor_type)}
    Goals: ${sanitize(application.goals)}
    Seriousness Score: ${sanitize(application.seriousness)}/10
    Experience: ${sanitize(application.experience)}
    Pillar: ${sanitize(application.pillar)}
    `.trim();

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Analyze the following mentorship application context:\n\n${userContext}`,
      config: {
        systemInstruction: "You are an expert application reviewer. Analyze the provided mentorship application for seriousness and quality. Provide a seriousness score from 1-10, an executive summary, a recommendation, and list any red flags. Output strictly in valid JSON format matching the requested schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "summary", "recommendation", "redFlags"]
        }
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: result.text || '{}',
    };
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return { 
      statusCode: 500, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "AI processing failed. Please try again later." }) 
    };
  }
};
