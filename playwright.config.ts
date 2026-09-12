import { defineConfig, devices } from "@playwright/test";
import { E2E_DATABASE_URL } from "./tests/e2e/fixtures";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

const E2E_ENV = {
  DATABASE_URL: E2E_DATABASE_URL,
  NEXTAUTH_URL: BASE_URL,
  NEXTAUTH_SECRET: "e2e-test-secret-not-for-production-000000",
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 60_000,
  expect: { timeout: 20_000 },
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Emulação mobile sobre Chromium (evita depender do WebKit, não
      // instalado neste ambiente) — suficiente para validar layout responsivo.
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    // Recria o schema e popula o banco de teste ANTES de subir o servidor,
    // tudo no mesmo comando — evita corrida entre setup e o servidor.
    // O arquivo prisma/e2e.db é um artefato descartável só do teste; removê-lo
    // antes do push evita usar --force-reset (bloqueado por guard do próprio
    // Prisma contra reset destrutivo disparado por agentes de IA).
    // Usamos build de produção (em vez de `next dev`) para evitar a
    // compilação sob demanda de cada rota na primeira visita, que tornava os
    // testes lentos e instáveis neste ambiente.
    command:
      'node -e "require(\'fs\').rmSync(\'prisma/e2e.db\',{force:true})" && npx prisma db push --skip-generate --accept-data-loss && npx tsx scripts/seed-e2e-db.ts && npx next build && npx next start --port 3100',
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 300_000,
    env: E2E_ENV,
  },
});
