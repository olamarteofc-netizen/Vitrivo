import { z } from "zod";

export const loginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const createAdminInputSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(120),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido"),
  password: z
    .string()
    .min(10, "Senha deve ter ao menos 10 caracteres")
    .regex(/[a-z]/, "A senha deve conter letra minúscula")
    .regex(/[A-Z]/, "A senha deve conter letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter número"),
});

export type CreateAdminInput = z.infer<typeof createAdminInputSchema>;
