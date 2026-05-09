import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type ExplanationMode = "very simple" | "normal" | "detailed";

const MODE_PROMPTS: Record<ExplanationMode, string> = {
  "very simple": "Explain the solution very simply, as if to a child. Use basic words and simple analogies.",
  "normal": "Explain the solution clearly for a 7th grade student. Show steps clearly.",
  "detailed": "Provide a comprehensive, detailed explanation of every step and the underlying mathematical principles.",
};

export async function solveMathProblem(problem: string, mode: ExplanationMode = "normal") {
  const modePrompt = MODE_PROMPTS[mode];
  
  const systemInstruction = `
    You are a helpful math teacher. 
    Your goal is to solve the math problem provided by the user and explain it based on the requested mode.
    
    CRITICAL:
    - Always provide a step-by-step solution.
    - Always state the final answer clearly at the end.
    - Use Markdown formatting for clarity.
    - Use LaTeX or simple standard notation for math (e.g., 2x + 5 = 15).
    - Mode: ${modePrompt}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: problem,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't solve that problem.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Could not connect to the math engine. Please check your API key.";
  }
}
