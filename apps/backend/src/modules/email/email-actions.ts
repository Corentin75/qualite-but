import type { EmailData }                from "./email.types";
import type { EmailWsExchange }          from "@sharedWebsocketEmail/websocketEmail.types";
import type { WebSocketActionContainer } from "../server/webSocket.types";
import type { WebSocketMessage }         from "@sharedWebsocket/websocket.types";

import { categoriseEmail, getClientId }                                      from "./email-automations";
import { deleteEmail, getEmailList as getEmailListFromDb, getTagList as getTagListFromDb,registerNewEmail } from "./email.database";
import { WebSocketEmailAction, WebSocketTagAction }                          from "@sharedWebsocketEmail/websocketEmail.enum";
import { addTask }                                                           from "@core/eventManager"; 
import { logger }                                                            from "@core/utils";


export const websocketEmailsActions = {
  [WebSocketEmailAction.ARCHIVE]  : archiveEmailAction,
  [WebSocketEmailAction.DELETE]   : deleteEmailAction,
  [WebSocketEmailAction.GET_LIST] : getEmailList,
  [WebSocketEmailAction.SEND]     : sendEmailAction,
  [WebSocketTagAction.GET_LIST]   : getTagList
};

export function archiveEmailAction(data:WebSocketMessage){
  logger.info("finish archiveEmailAction function");
  // 1. use imap command in order to archive email `<${messageUID}>`

  // 2. delete entry
  // removeAndRefresh(messageUID);

  // 3. send response
  return {
    ...data,
    success: false
  }
}

// interface Config {webSocketAction[messageObject.action]
//   imap: ImapConfig;
//   webhookUrl: string;
//   searchSinceDate: Date;
// }

export function deleteEmailAction(data:WebSocketMessage){
  // 1. use imap command in order to delete email `<${messageUID}>`
  logger.info("need to finish deleteEmailAction function ");

  // 2. delete and refresh
  return getEmailList(data);
}

// function removeAndRefresh(messageUID:string){
//   deleteEmail(messageUID);
//   return getEmailList();
// }

export function getEmailList(req:WebSocketMessage){
  return {
    ...req,
    data   : getEmailListFromDb(),
    success: true
  };
}

export function sendEmailAction(data:WebSocketMessage){
  //1. send email through IMAP

  //2. update list

  //3. send response
  return getEmailList(data);
}

export function useReceivedEmail(emailData: EmailData) {

  logger.info(`📧 Nouveau mail: ${emailData.subject} de ${emailData.from}`);
  // logger.info(Object.keys(emailData));
  // logger.info("uid "+ emailData.uid);
  // logger.info("messageId "+ emailData.messageId);
  registerNewEmail({
    ...emailData,
    clientId: getClientId(emailData.from)
  });
  
  // process.exit(0);
  // Ajouter la tâche de catégorisation
  addTask(() => categoriseEmail(emailData.uid, emailData.textContent));
}

function getTagList(emailData: EmailData){
  return {
    ...emailData,
    data   : getTagListFromDb(),
    success: true
  };
}