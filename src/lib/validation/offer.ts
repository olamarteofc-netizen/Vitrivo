import { z } from "zod";

export const offerInputSchema = z.object({
  productId: z.string().trim().min(1),
  marketplaceId: z.string().trim().min(1, "Selecione um marketplace"),
  destinationUrl: z.string().trim().url("Informe uma URL válida"),
  affiliateUrl: z
    .string()
    .trim()
    .url("Informe uma URL de afiliado válida")
    .refine((v) => v.startsWith("https://"), "A URL de afiliado deve usar HTTPS"),
  referencePrice: z
    .number()
    .nonnegative("Preço não pode ser negativo")
    .optional()
    .nullable(),
  currency: z
    .string()
    .trim()
    .length(3, "Use o código de 3 letras da moeda (ex.: BRL)")
    .toUpperCase()
    .optional()
    .default("BRL"),
  label: z
    .string()
    .trim()
    .max(80)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  notes: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  isPrimary: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  position: z.number().int().min(0).optional().default(0),
});

export type OfferInput = z.infer<typeof offerInputSchema>;
