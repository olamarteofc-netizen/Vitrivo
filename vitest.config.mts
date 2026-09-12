import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

const TEST_DATABASE_URL = "file:./test.db";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    globalSetup: ["./tests/global-setup.ts"],
    // Testes de integração compartilham um único arquivo SQLite; rodar em
    // processo único evita "database is locked" por escrita concorrente.
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      NEXTAUTH_SECRET: "test-secret-not-for-production-0000000000",
      NEXTAUTH_URL: "http://localhost:3000",
    },
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
});
