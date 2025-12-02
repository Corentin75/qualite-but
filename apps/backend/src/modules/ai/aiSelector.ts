import type { GenerateContentResponse } from "@google/genai";
import type { AiInteraction }           from "@settings/ai.settings";

import { askGemini } from "./gemini";
import { askOllama } from "./ollama";

/*
modelId :
  0 : undefined
  1 : gemini
  2 : ollama
*/
let modelId = 0;

enum Model {
  GEMINI = "gemini",
  OLLAMA = "ollama",
}

/**
 * Ask an AI model a question. The AI model is determined by the
 * defineModel() function, which looks for the existence of a
 * settings file for either the Gemini or Ollama AI models. If both
 * files exist, the Gemini model is used. If neither file exists,
 * an Error is thrown.
 * @param {string} question - the question to ask the AI model
 * @returns {Promise<string>} - the response from the AI model
 * @throws {Error} - if no AI model is defined
 */
export async function useAI(question:string, questionType:AiInteraction): Promise<GenerateContentResponse> {
  switch (defineModel()) {
    case 1:
      return await askGemini(question, questionType);
    case 2:
      return await askOllama(question, questionType);
    default:
      throw new Error("No AI model defined");
  }
}

/**
 * Defines which AI model to use. It first checks if the modelId
 * has already been set. If not, it tries to require the
 * settings file for the Gemini AI model. If that fails, it
 * tries to require the settings file for the Ollama AI model.
 * If both files cannot be found, it sets the modelId to 0.
 * @returns {number} the modelId to use. 0 if no model is defined.
 */
function defineModel() {
  if (modelId !== 0) return modelId;
  try {
    require.resolve(getSettingsPath(Model.GEMINI));
    modelId = 1;
  }
  catch (error) {
    try {
      require.resolve(getSettingsPath(Model.OLLAMA));
      modelId = 2;
    } catch (error2) {
      modelId = 0;
    }
  }
  finally {
    return modelId;
  }
}

/**
 * Returns the path to the settings file for the given AI model.
 * @param {Model} model - the AI model to get the settings path for
 * @returns {string} the path to the settings file
 */
function getSettingsPath(model: Model) {
  return `@settings/${model}.settings`;
}
