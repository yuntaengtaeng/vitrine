import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitrine from "@vitrine/vite-plugin";

export default defineConfig({
  plugins: [react(), vitrine()],
});
