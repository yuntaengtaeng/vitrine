import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitrine from "vite-plugin-react-vitrine";
import vitrineStatic from "vitrine-plugin-static";

export default defineConfig({
  plugins: [react(), vitrine({ setupFile: "./src/vitrine.preview.tsx", plugins: [vitrineStatic()] })],
});
