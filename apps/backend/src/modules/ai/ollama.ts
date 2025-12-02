import type { AiInteraction }           from "@settings/ai.settings";
import type { GenerateContentResponse } from "@google/genai";

const ollama = require('ollama');

export async function askOllama(prompt:string, questionType:AiInteraction): Promise<GenerateContentResponse> {
  // return (await ollama.generate({ model: ollamaSettings.model[questionType], prompt })).response;
  return {
    text: "",
  };
}