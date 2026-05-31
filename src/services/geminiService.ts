import { Application, Booking } from "../types";

export const getApplicationSummary = async (app: Application) => {
  try {
    const response = await fetch('/api/analyze-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application: app })
    });
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (error) {
    console.error("Analysis Error:", error);
    return { score: 0, summary: "Analysis unavailable.", recommendation: "Manual review required.", redFlags: [] };
  }
};

export const getPreSessionBrief = async (booking: Booking, studentContext: string, purchasedProducts: string[] = []) => {
  try {
    const response = await fetch('/api/generate-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking, studentContext, purchasedProducts })
    });
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Brief error:", error);
    return "Brief could not be generated.";
  }
};

export const chatWithAssistant = async (history: { role: 'user' | 'model', text: string }[], message: string) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, message })
    });
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm sorry, I'm experiencing some technical difficulties. Please try again.";
  }
};