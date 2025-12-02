import { defineConfig } from 'vite';
import path from "path";
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@appSettings'         : path.resolve(__dirname, "../../settings"),
      '@components'          : path.resolve(__dirname, "./src/components"),
      '@scss'                : path.resolve(__dirname, "./src/style"),
      '@sharedWebsocket'     : path.resolve(__dirname, "../../packages/websocket"),
      '@sharedWebsocketEmail': path.resolve(__dirname, "../../packages/websocketEmail"),
      '@store'               : path.resolve(__dirname, "./src/stores"),
    },
  },
});