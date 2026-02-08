
import { GoogleGenAI, Type } from "@google/genai";

// Initialize with a named parameter using process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudyContent = async (topic: string) => {
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
