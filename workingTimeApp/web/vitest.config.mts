import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Next.js 公式ガイド（node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md）の設定がもと。
// "@/..." の import は、vite-tsconfig-paths の代わりに Vite 8 の resolve.tsconfigPaths で解決する（api と同じ）。
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", ".next/**"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
