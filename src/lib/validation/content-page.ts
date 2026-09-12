import { z } from "zod";
import { CONTENT_PAGE_STATUSES, CONTENT_PAGE_TYPES } from "@/types";

export const contentPageInputSchema = z.object({
  title: z.string().trim().min(3, "Título deve ter ao menos 3 caracteres").max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífen")
    .optional(),
  body: z.string().trim().min(1, "Conteúdo não pode ficar vazio"),
  type: z.enum(CONTENT_PAGE_TYPES).optional().default("PAGE"),
  status: z.enum(CONTENT_PAGE_STATUSES).optional().default("DRAFT"),
  seoTitle: z
    .string()
    .trim()
    .max(70)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  seoDescription: z
    .string()
    .trim()
    .max(160)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
});

export type ContentPageInput = z.infer<typeof contentPageInputSchema>;
