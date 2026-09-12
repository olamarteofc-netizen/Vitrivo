/**
 * Tipos compartilhados entre camadas. O schema Prisma usa `String` puro em
 * vez de enums nativos (para manter portabilidade SQLite/Postgres); estes
 * union types são a fonte de verdade em nível de aplicação e são validados
 * via Zod em src/lib/validation.
 */

export const PRODUCT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const MEDIA_TYPES = ["IMAGE", "VIDEO"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const ADMIN_ROLES = ["ADMIN", "EDITOR"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const CONTENT_PAGE_TYPES = ["PAGE", "GUIDE"] as const;
export type ContentPageType = (typeof CONTENT_PAGE_TYPES)[number];

export const CONTENT_PAGE_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type ContentPageStatus = (typeof CONTENT_PAGE_STATUSES)[number];

export const DEVICE_CLASSES = ["mobile", "tablet", "desktop", "unknown"] as const;
export type DeviceClass = (typeof DEVICE_CLASSES)[number];

export type ProductSpecification = {
  label: string;
  value: string;
};

export type SortOption = "destaque" | "recentes" | "populares";
