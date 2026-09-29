import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const DEFAULT_API_PORT = "3001";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = `http://localhost:${env.API_PORT ?? DEFAULT_API_PORT}`;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // o site chama /api/... e o Vite repassa pro Express
      proxy: { "/api": apiUrl },
    },
  };
});
