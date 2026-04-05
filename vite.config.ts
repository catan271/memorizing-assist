import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/memorizing-assist/",
  plugins: [react()],
});
