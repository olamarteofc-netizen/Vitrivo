import { z } from "zod";

/**
 * Variáveis de ambiente de servidor. Nunca importe este módulo de um
 * componente cliente — ele só deve ser usado em código server-side
 * (Server Components, Server Actions, route handlers, scripts).
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório"),
  NEXTAUTH_SECRET: z
    .string()
    .min(16, "NEXTAUTH_SECRET deve ter pelo menos 16 caracteres"),
  NEXTAUTH_URL: z.string().url().optional(),
  REDIRECT_EXTRA_ALLOWED_HOSTS: z.string().optional().default(""),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

/**
 * Lê e valida as variáveis de ambiente de servidor. Lança um erro com
 * mensagem clara (sem expor valores) quando algo obrigatório está ausente.
 */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Configuração de ambiente inválida: ${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/** Lista de hosts extra liberados via variável de ambiente (reforço de infra). */
export function getExtraAllowedHosts(): string[] {
  const raw = process.env.REDIRECT_EXTRA_ALLOWED_HOSTS ?? "";
  return raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}
