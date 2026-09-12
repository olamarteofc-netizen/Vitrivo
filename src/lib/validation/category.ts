import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífen")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  imageUrl: z
    .string()
    .trim()
    .url("Informe uma URL válida")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  active: z.boolean().optional().default(true),
  position: z.number().int().min(0).optional().default(0),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const tagInputSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(60),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífen")
    .optional(),
});

export type TagInput = z.infer<typeof tagInputSchema>;
