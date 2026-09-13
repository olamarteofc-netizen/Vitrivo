import { execSync } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env.test.local") });

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const TEST_DIRECT_URL = process.env.TEST_DIRECT_URL ?? TEST_DATABASE_URL;

/**
 * Roda uma vez antes de toda a suíte (unit + integration). Garante um banco
 * de teste Postgres limpo e com o schema atualizado, isolado do banco de
 * produção — nunca aponte TEST_DATABASE_URL para o banco de produção.
 *
 * Requer um Postgres de teste dedicado (ex.: um segundo database no mesmo
 * projeto Neon) configurado em `.env.test.local` (arquivo local, ignorado
 * pelo git — ver `.env.example`).
 */
export default async function globalSetup() {
  if (!TEST_DATABASE_URL) {
    throw new Error(
      "TEST_DATABASE_URL não configurado. Crie .env.test.local com TEST_DATABASE_URL (e opcionalmente " +
        "TEST_DIRECT_URL) apontando para um banco Postgres de teste — nunca para o banco de produção.",
    );
  }

  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL, DIRECT_URL: TEST_DIRECT_URL },
  });
}
