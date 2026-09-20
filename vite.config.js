import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        logistics: resolve(__dirname, "cases/neural-logistics.html"),
        clinical: resolve(__dirname, "cases/clinical-triage.html"),
        fraud: resolve(__dirname, "cases/fraud-graph.html"),
        foundation: resolve(__dirname, "cases/foundation-stack.html"),
        migration: resolve(__dirname, "cases/code-migration.html"),
        edge: resolve(__dirname, "cases/edge-perception.html"),
      },
    },
  },
});
