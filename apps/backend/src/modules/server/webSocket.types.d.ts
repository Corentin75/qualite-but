import type { WebSocketMessage } from "@sharedWebsocket/websocket.types.d";

export type WebSocketActionContainer = {
  [key: string]: (data?: WebSocketMessage) => WebSocketMessage;
};