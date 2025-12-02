import type { EmailWsExchange, TagListResponse } from "@sharedWebsocketEmail/websocketEmail.types";

export interface WebSocketMessage {
  action           : string
  data            ?: unknown | EmailWsExchange | TagListResponse[]
  parentMessageUID?: string
  success         ?: boolean
}