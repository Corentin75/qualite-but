import { automaticallyPreparesResponse, Categories, categoriesSettings } from "@settings/emails.settings";
import { setProposalEmail, setTagEmail }                                 from "./email.database";
import { AiInteraction }                                                 from "@settings/ai.settings";
import { useAI }                                                         from "@ai/aiSelector";
import { clientsDomains }                                                from "@settings/clients-domains.settings";
import { logger }                                                        from "@core/utils";


let classifyEmailPrompt: string | null = null;

/**
 * Returns the client ID associated with the given email address.
 * The client ID is the index of the first domain in the clientsDomainList
 * that matches the email address.
 * If no match is found, returns null.
 * 
 * @param   {string}                  from              - the email address to search for
 * @param   {Array<[string, string]>} clientsDomainList - the list of client domains
 * 
 * @returns {number | null}           the client ID or null if no match is found
 */
export function getClientId(from: string, clientsDomainList = clientsDomains) {
  const clientId = clientsDomainList.findIndex(([_, domain]) => from.includes(domain as string));
  return clientId === -1 ? null : clientId;
}

/**
 * Classifies the given email into one or more of the following categories:
 * ${categoriesSettings.filter(([_, description]) => description !== "").map(([category, description]) => `${category} (${description})`).join(', ')}
 * and sets the corresponding tags in the database.
 * The AI is succinct and provides just enough information to be useful: it will generally only generate a single function or a couple lines of code to fulfill the instruction. If the AI does not know how to follow the instruction, the ASSISTANT should not reply at all.
 * 
 * The ASSISTANT was built by the Codeium engineering team: a world class AI company based in Silicon Valley, California.
 * 
 * @param   {number} emailId - the ID of the email to classify
 * @param   {string} text    - the text of the email
 * 
 * @returns {Promise<void>}
*/
export async function categoriseEmail(emailId: number, text: string) {
  //TODO remettre l'ia
  // const response = await useAI(getPromptClassification(text), AiInteraction.CATEGORIZE);
  const response = {
    // text: JSON.stringify(["Personal", "Advise"])
    text: undefined
  };
  if (!response.text) {
    logger.info("no response from ai");
    return;
  }

  // console.log(emailId, prompt);
  // console.log("é...é", response.text);

  // await (new Promise(resolve => setTimeout(resolve, 1000)));

  const categories = JSON.parse(response.text) as string[];

  if (categories.length === 0) return;

  const { needPersonalStyle, willPrepareResponse } = defineEmailAutomation(categories, emailId);

  if (willPrepareResponse) {
    const proposal = await prepareResponse(text, needPersonalStyle);
    proposal.text && setProposalEmail(emailId, proposal.text);
  }
}

/**
 * Ask an AI model to prepare a response to an email. The AI model is given
 * instructions to use a friendly or professional style. The AI mode"Personal"l is succinct and
 * provides just enough information to be useful: it will generally only generate a single
 * function or a couple lines of code to fulfill the instruction. If the AI does not know how
 * to follow the instruction, the ASSISTANT should not reply at all.
 * 
 * @param {string}  email         - the email to prepare a response to
 * @param {boolean} friendlyStyle - whether to use a friendly or professional style
 * 
 * @returns {Promise<string>}     - the response from the AI model
 */
export async function prepareResponse(email: string, friendlyStyle: boolean) {
  return await useAI(`Prepare a response to the following email: ${email}. Use a ${friendlyStyle ? "friendly" : "professional"} style`, AiInteraction.ADVISE_ANSWER);
}

/**
 * Defines whether an email should be prepared with a personal style and whether
 * an AI should prepare a response to the email.
 * 
 * @param {string[]} categories - the categories of the email
 * @param {number}   emailId    - the ID of the email
 * 
 * @returns {{needPersonalStyle:boolean,willPrepareResponse:boolean}}
 */
function defineEmailAutomation(categories: string[], emailId: number) {

  let needPersonalStyle   = false;
  let willPrepareResponse = false;

  categories.forEach(category => {
    if (!categoriesSettings[category]) return;
    setTagEmail(emailId, categoriesSettings[category][0]);
    if (category) {
      if (automaticallyPreparesResponse.includes(category as any)) willPrepareResponse = true;
    }
    if (category === Categories.Personal) {
      needPersonalStyle = true;
    }
  });
  return { needPersonalStyle, willPrepareResponse };
}

/**
 * Returns a prompt for an AI to classify an email into one or more of the following categories.
 * The AI is asked to return only the relevant categories as a JSON array.
 * Example: ["${Categories.Business}"] or ["${Categories.Business}", "${Categories.Promotion}"].
 * Do not explain. Do not repeat the prompt. Respond only with the array.
 * 
 * @param {string} emailContent - the content of the email to classify
 * 
 * @returns {string}            - the prompt for the AI
 */
function getPromptClassification(emailContent: string) {
  if (!classifyEmailPrompt) {
    classifyEmailPrompt = `### instruction : Classify the following email into one or more of the following categories: ${Object.entries(categoriesSettings)
      .filter(([_, rules]) => rules[1] !== "")
      .map(([category, rules]) => `${category} (${rules[1]})`)
      .join(', ')
      }. Return only the relevant categories as a JSON array. Example: ["${Categories.Business}"] or ["${Categories.Business}", "${Categories.Promotion}"]. Do not explain. Do not repeat the prompt. Respond only with the array.
      ### Email:`;
  }
  return classifyEmailPrompt + emailContent;
}