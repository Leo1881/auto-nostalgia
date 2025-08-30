import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? "/auto-nostalgia/" : "/",
  server: {
    allowedHosts: [
      "localhost",
      ".loca.lt",
      "auto-nostalgia-simple.loca.lt",
      "auto-nostalgia-demo-2024.loca.lt",
      "auto-nostalgia-test.loca.lt",
      "plain-buckets-fail.loca.lt",
      "lemon-tables-tan.loca.lt",
      "rare-ads-care.loca.lt",
      ".ngrok-free.app",
      "2c7d4773d71a.ngrok-free.app",
    ],
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
});
