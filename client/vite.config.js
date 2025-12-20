import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "https://florascan-ai-powered-plant-analysis-tool.onrender.com",
    },
  },
});
