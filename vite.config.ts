import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Standard Vite + React (no third-party dev-only tagging plugins).
// Factory form kept so `mode`-based plugin wiring is easy to add later.
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  build: {
    // NFR4: match tsconfig.app.json (ES2020) for predictable browser baseline
    target: "es2020",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
