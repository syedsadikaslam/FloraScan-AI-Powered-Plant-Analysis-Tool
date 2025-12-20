import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/analyze": {
        target: "https://florascan-ai-powered-plant-analysis-tool.onrender.com",
        changeOrigin: true,
        secure: true,
      },
      "/download": {
        target: "https://florascan-ai-powered-plant-analysis-tool.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
