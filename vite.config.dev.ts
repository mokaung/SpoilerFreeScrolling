import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Dev-only config: serves the popup UI in the browser with HMR. No extension build. */
export default defineConfig({
  plugins: [tailwindcss(), react()],
  root: ".",
});
