import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

function getClient(): GoogleGenAI {
  if (!apiKey) throw new Error("Gemini API key is not set. Add VITE_GEMINI_API_KEY in Vercel (or .env) to use AI Assist.");
  return new GoogleGenAI({ apiKey });
}

export const generateStudyContent = async (topic: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Help a researcher draft a formal listing for a study about: ${topic}. 
    Provide a professional title, a clear description, and strict eligibility criteria.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          eligibility: { type: Type.STRING },
        },
        required: ["title", "description", "eligibility"]
      }
    }
  });

  // Access the .text property directly (do not call as a method).
  return JSON.parse(response.text || "{}");
};
