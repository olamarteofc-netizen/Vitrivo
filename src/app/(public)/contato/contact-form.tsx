"use client";

import { useActionState } from "react";
import { Input, Textarea, Label, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { submitContactForm, type ContactFormState } from "./actions";

const initialState: ContactFormState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 text-sm text-brand-800">
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* honeypot anti-spam — mantido fora da vista de humanos */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required minLength={2} maxLength={120} />
        <FieldError>{state.errors?.name}</FieldError>
      </div>

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required />
        <FieldError>{state.errors?.email}</FieldError>
      </div>

      <div>
        <Label htmlFor="message">Mensagem</Label>
        <Textarea id="message" name="message" required minLength={10} maxLength={2000} rows={5} />
        <FieldError>{state.errors?.message}</FieldError>
      </div>

      {state.status === "error" && state.message && <FieldError>{state.message}</FieldError>}

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Enviar mensagem"}
      </Button>
    </form>
  );
}
