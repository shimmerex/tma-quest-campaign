import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "0f5e-2a00-20-6361-3c10-7818-bac5-28f3-754.ngrok-free.app",
      // Или проще: разрешить вообще все ngrok-домены
      ".ngrok-free.app",
    ],
  },
});
