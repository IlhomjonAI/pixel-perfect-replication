import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./frontend/tests/setup.ts"],
    include: ["{frontend,backend}/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./frontend"),
      "@school/contracts": path.resolve(import.meta.dirname, "./packages/contracts"),
      "@backend": path.resolve(import.meta.dirname, "./backend"),
      "@admin": path.resolve(import.meta.dirname, "./frontend/admin"),
    },
  },
});
