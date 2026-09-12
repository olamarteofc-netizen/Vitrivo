/**
 * CLI para criar o primeiro administrador (ou administradores adicionais).
 *
 * Uso interativo:
 *   npm run admin:create
 *
 * Uso não interativo (útil em CI/scripts):
 *   npm run admin:create -- --name "Nome" --email admin@exemplo.com --password "SenhaForte123"
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout, argv } from "node:process";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createAdminInputSchema } from "../src/lib/validation/auth";

const prisma = new PrismaClient();

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const direct = argv.find((a) => a.startsWith(prefix));
  if (direct) return direct.slice(prefix.length);
  const idx = argv.indexOf(`--${name}`);
  if (idx !== -1 && argv[idx + 1]) return argv[idx + 1];
  return undefined;
}

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

async function main() {
  console.log("=== Criar administrador — VITRIVO ===\n");

  const name = parseArg("name") ?? (await prompt("Nome: "));
  const email = parseArg("email") ?? (await prompt("E-mail: "));
  const password = parseArg("password") ?? (await prompt("Senha (mín. 10 caracteres, com maiúscula, minúscula e número): "));

  const parsed = createAdminInputSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    console.error("\nDados inválidos:");
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    console.error(`\nJá existe um administrador com o e-mail ${parsed.data.email}.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const admin = await prisma.adminUser.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: "ADMIN" },
  });

  console.log(`\nAdministrador criado com sucesso: ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
