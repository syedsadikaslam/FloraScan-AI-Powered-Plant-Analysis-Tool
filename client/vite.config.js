import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    server: {
      // Proxy removed to ensure direct connection to localhost:5000
    },
  },
});
