"use server";

import { createContactMessage } from "@/lib/services/contact";
import { contactInputSchema } from "@/lib/validation/contact";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    website: formData.get("website"),
  };

  const parsed = contactInputSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] = issue.message;
    }
    return { status: "error", errors };
  }

  try {
    await createContactMessage(parsed.data);
    return { status: "success", message: "Mensagem enviada! Responderemos pelo e-mail informado em breve." };
  } catch {
    return { status: "error", message: "Não foi possível enviar sua mensagem agora. Tente novamente em instantes." };
  }
}
