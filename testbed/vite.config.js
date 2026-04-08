import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Root = the whatscooking folder (one level above testbed)
const root    = path.resolve(__dirname, "..");
const testbed = __dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Let imports like '@root/RecipeGenerator.jsx' and '@root/src/...' resolve correctly
      "@root": root,
    },
    // BP-24: allow the bundler to resolve react/react-dom from testbed's node_modules
    // even when the consuming file (RecipeGenerator.jsx) lives one level up
    dedupe: ["react", "react-dom"],
  },
  server: {
    fs: {
      // Allow Vite to serve files from the workspace root, not just testbed/
      allow: [root, testbed],
    },
  },
  optimizeDeps: {
    // Ensure react is pre-bundled from testbed's node_modules
    include: ["react", "react-dom"],
  },
});
