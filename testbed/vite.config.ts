import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const root    = path.resolve(__dirname, "..");
const testbed = __dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@root": root,
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    fs: {
      allow: [root, testbed],
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
