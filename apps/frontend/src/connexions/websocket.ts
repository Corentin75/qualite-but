
// import { WebSocketEmailAction } from '@sharedEnums/email.enum';
import type { WebSocketMessage } from "@sharedWebsocket/websocket.types";
import type { RegisterActionsObj } from "./websocket.types";

// import { host, port } from "@appSettings/server.settings"; TODO fix import

const host = "192.168.1.11";
const port = 3000;

const webSocketAction: { [key: string]: (...args: unknown[])=>void | Promise<void> } = {};
// const connectionTasks: Function[] = [];

/* avoid to reconnect if already connected */
let lock = false;

/* WebSocket connection */
let ws: WebSocket;

export function startWebsocket(onConnectionAction: () => void) {

  if (lock) return;
  lock = true;

  ws = new WebSocket('ws://'+host+':'+port);
  ws.onopen = () => {
    console.log('WebSocket connected');
    onConnectionAction();
  };

 ws.onmessage = (event) => {
    const parsedMessage: WebSocketMessage = JSON.parse(event.data);
    console.log("onmessage", parsedMessage);
    try {
      if (!parsedMessage.action || !parsedMessage.data) {
        throw new Error("Invalid WebSocket message");
      }
      if (webSocketAction[parsedMessage.action]) {
        webSocketAction[parsedMessage.action](parsedMessage);
      }
      else throw new Error("unkown action");
    }
    catch (error) {
      console.error({ error }, "Error processing WebSocket message");
    }
    finally {
      // sendWsSuccessMessage(parentMessageUID, succeeded);
    }
  }
  // return onConnectionAction && onConnection(onConnectionAction);
}

export function sendWs(msg: WebSocketMessage) {
  console.log("sendWs", msg, JSON.stringify(msg));
  ws.send(JSON.stringify(msg));
}

// export function isConnected() {
//   /*
//   0	CONNECTING	La socket a été créée. La connexion n'est pas encore ouverte.
//   1	OPEN	      La connexion est ouverte et prête pour la communication.
//   2	CLOSING	    La connexion est en cours de fermeture.
//   3	CLOSED	    La connexion est fermée ou n'a pas pu être ouverte.
//   */
//   return ws?.readyState === 1;
// }


/**
 * Adds a function to be called when the WebSocket connection is established.
 * If the connection is already established, the function is called immediately.
 * Otherwise, the function is called after a timeout of 1000ms.
 * @param {Function} [fn] - The function to be called when the connection is established.
 */
// export function onConnection(fn?: () => void) {

//   console.log("onConnection", fn);

//   function executeConnectionTasks() {
//     while (connectionTasks.length > 0) {
//       const tmp = connectionTasks.shift();
//       console.log("executeConnectionTasks", tmp);
//       tmp();
//       // (connectionTasks.shift() as () => void)();
//     }
//   }

//   if (fn) connectionTasks.push(fn);
//   return ws?.readyState === 1
//     ? executeConnectionTasks()
//     : setTimeout(() => onConnection(), 1000);
// }


export function registerAction(methodName: string, method: ()=>void) {
  if (webSocketAction[methodName]) throw new Error(`Action ${methodName} already registered`); 
  webSocketAction[methodName] = method;
}

export function registerActions(methodsObj:RegisterActionsObj) {
  for (const [methodName, methodFn] of Object.entries(methodsObj)) {
    registerAction(methodName, methodFn);
  }
}