import { GoogleGenAI, Type } from "@google/genai";
import { aiAnalyzeApplicationSchema } from "../src/schemas/ai.schema.js";

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
    aiAnalyzeApplicationSchema.parse(body);
  } catch (zodError: any) {
    return Response.json({ error: "Validation failed", details: zodError.errors }, { status: 400 });
  }

  try {
    const { application } = body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
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

    return new Response(result.text || '{}', {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return Response.json({ error: "AI processing failed. Please try again later." }, { status: 500 });
  }
}
