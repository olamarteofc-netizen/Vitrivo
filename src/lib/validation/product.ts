import { z } from "zod";
import { PRODUCT_STATUSES } from "@/types";

export const specificationSchema = z.object({
  label: z.string().trim().min(1, "Informe o rótulo").max(120),
  value: z.string().trim().min(1, "Informe o valor").max(300),
});

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined));

export const productInputSchema = z.object({
  title: z.string().trim().min(3, "Título deve ter ao menos 3 caracteres").max(160),
  slug: z
    .string()
    .trim()
    .min(3, "Slug deve ter ao menos 3 caracteres")
    .max(160)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífen")
    .optional(),
  shortDescription: z.string().trim().min(10, "Resumo deve ter ao menos 10 caracteres").max(300),
  description: z.string().trim().min(20, "Descrição deve ter ao menos 20 caracteres"),
  benefits: z.array(z.string().trim().min(1).max(300)).max(20).optional().default([]),
  howItWorks: optionalText(4000),
  specifications: z.array(specificationSchema).max(30).optional().default([]),
  warnings: optionalText(2000),
  categoryId: z.string().trim().min(1).optional().nullable(),
  tagIds: z.array(z.string().trim().min(1)).optional().default([]),
  featured: z.boolean().optional().default(false),
  seoTitle: optionalText(70),
  seoDescription: optionalText(160),
  status: z.enum(PRODUCT_STATUSES).optional().default("DRAFT"),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export const productMediaInputSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO"]),
  url: z.string().trim().url("Informe uma URL válida"),
  altText: z.string().trim().max(200).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  position: z.number().int().min(0).optional().default(0),
});

export type ProductMediaInput = z.infer<typeof productMediaInputSchema>;
