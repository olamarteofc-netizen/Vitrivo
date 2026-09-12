import { z } from "zod";

const HOST_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;

/**
 * Aceita hosts separados por vírgula ou quebra de linha, normaliza (minúsculo,
 * sem "www.", sem espaços) e valida o formato de cada um.
 */
export const allowedHostsInputSchema = z
  .string()
  .trim()
  .min(1, "Informe ao menos um domínio permitido")
  .transform((raw) =>
    raw
      .split(/[\n,]/)
      .map((h) => h.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, ""))
      .filter(Boolean),
  )
  .refine((hosts) => hosts.length > 0, "Informe ao menos um domínio permitido")
  .refine((hosts) => hosts.every((h) => HOST_REGEX.test(h)), {
    message: "Um ou mais domínios têm formato inválido (ex.: shopee.com.br)",
  });

export const marketplaceInputSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífen")
    .optional(),
  logoUrl: z
    .string()
    .trim()
    .url("Informe uma URL válida")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  disclosureText: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  allowedHosts: allowedHostsInputSchema,
  active: z.boolean().optional().default(true),
});

export type MarketplaceInput = z.infer<typeof marketplaceInputSchema>;
