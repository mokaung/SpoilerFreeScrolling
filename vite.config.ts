/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import manifest from "./manifest.json" with { type: "json" };

export default defineConfig({
  base: "./",
  plugins: [tailwindcss(), react(), crx({ manifest })],
  build: {
    outDir: "dist"
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
