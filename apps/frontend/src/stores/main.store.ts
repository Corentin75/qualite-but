import { create } from 'zustand'

import { startWebsocket } from '../connexions/websocket'

export interface MainStore {
  isConnected: boolean
  setIsConnected: (isConnected: boolean) => void
}

export const useMainStore = create<MainStore>((set) => ({
  isConnected: false,
  setIsConnected: (isConnected: boolean) => set({ isConnected }),
}))

startWebsocket(()=>useMainStore.getState().setIsConnected(true));