import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { UserConfig } from "vite";
import type { InlineConfig } from "vitest/node";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
  },
} as UserConfig & { test: InlineConfig });
