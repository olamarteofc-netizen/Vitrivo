import { z } from "zod";

export const contactInputSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido"),
  message: z.string().trim().min(10, "Mensagem deve ter ao menos 10 caracteres").max(2000),
  // honeypot: campo invisível para humanos; se vier preenchido, é bot.
  website: z.string().max(0, "").optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactInputSchema>;
