import type { Server }                   from "bun";
import type { WebSocketActionContainer } from "./webSocket.types";

// import { WebSocketEmailAction } from "@sharedWebsocketEmail/websocketEmail.enum";
// import { getEmailList }         from "../email/email-actions";
import { logger }                 from "@core/utils";
import { websocketEmailsActions } from "../email/email-actions";

let server = {} as Server;

export const webSocketAction : WebSocketActionContainer = {
  ...websocketEmailsActions
};

export function runServer() {
  server = Bun.serve({
    fetch(req, server) {
      const success = server.upgrade(req);
      if (success) {
        // Bun automatically returns a 101 Switching Protocols
        // if the upgrade succeeds
        return undefined;
      }

      // handle HTTP request normally
      return new Response("Hello world!");
    },
    websocket: {
      // TypeScript: specify the type of ws.data like this
      data: {} as { authToken: string },

      // this is called when a message is received
      async message(ws, message) {
        const messageObject = JSON.parse(message.toString());
        console.log("message", messageObject.action, Object.keys(webSocketAction), webSocketAction[messageObject.action]);
        const response = messageObject.action && webSocketAction[messageObject.action]
          ? await webSocketAction[messageObject.action](messageObject)
          : { error: "unkown action" };
        const debug  = {...response};
        delete debug.data;
        logger.info(debug);
        ws.send(JSON.stringify(response));
      },
    },
  });
  logger.info(`Listening on ${server.hostname}:${server.port}`);
}
console.log("server.ts");