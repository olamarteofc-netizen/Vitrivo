import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";

const TEST_DB_PATH = path.resolve(__dirname, "../prisma/test.db");
const TEST_DATABASE_URL = "file:./test.db";

/**
 * Roda uma vez antes de toda a suíte (unit + integration). Garante um banco
 * de teste limpo e com o schema atualizado, isolado do banco de
 * desenvolvimento (dev.db).
 */
export default async function globalSetup() {
  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH);
  }

  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });
}
