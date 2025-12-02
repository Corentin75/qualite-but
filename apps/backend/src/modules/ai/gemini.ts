import type { AiInteraction } from '@settings/ai.settings';

import {GoogleGenAI}  from '@google/genai';
import geminiSettings from "@settings/gemini.settings";

const ai = new GoogleGenAI({apiKey: geminiSettings.apiKey});

export async function askGemini(question:string, questionType:AiInteraction) {
  return await ai.models.generateContent({
    model   : geminiSettings.model[questionType],
    contents: question,
  });
}