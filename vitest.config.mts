import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env.test.local") });

// Banco Postgres de teste isolado (nunca o de produção) — ver
// tests/global-setup.ts e .env.example para instruções.
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? "";
const TEST_DIRECT_URL = process.env.TEST_DIRECT_URL ?? TEST_DATABASE_URL;

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
    // Testes de integração fazem I/O real contra um Postgres remoto (Neon);
    // 5s (padrão do Vitest) é curto demais para vários round-trips em série.
    testTimeout: 20000,
    // Testes de integração compartilham um único banco Postgres de teste;
    // rodar em processo único evita corrida entre testes que não isolam
    // dados por completo (ex.: contagens globais).
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      DIRECT_URL: TEST_DIRECT_URL,
      NEXTAUTH_SECRET: "test-secret-not-for-production-0000000000",
      NEXTAUTH_URL: "http://localhost:3000",
    },
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
});
