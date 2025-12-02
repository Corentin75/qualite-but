import { AiInteraction } from "./ai.settings.js";

enum GeminiModel {
  DEFAULT = "gemini-2.5-flash"
}

export default {
  apiKey: "xxxxxxxxxxx",
  model : {
    [AiInteraction.ADVISE_ANSWER]: GeminiModel.DEFAULT,
    [AiInteraction.CATEGORIZE]   : GeminiModel.DEFAULT,
    [AiInteraction.DEFAULT]      : GeminiModel.DEFAULT    
  }
}
