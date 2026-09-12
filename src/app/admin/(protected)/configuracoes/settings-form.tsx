"use client";

import { useActionState } from "react";
import { Textarea, Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { updateSettingsAction, type SettingsFormState } from "./actions";

export function SettingsForm({
  heroTitle,
  heroSubtitle,
  heroCtaLabel,
  curationText,
}: {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  curationText: string;
}) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, { status: "idle" } as SettingsFormState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="heroTitle">Título do banner inicial</Label>
        <Input id="heroTitle" name="heroTitle" required defaultValue={heroTitle} />
      </div>
      <div>
        <Label htmlFor="heroSubtitle">Subtítulo do banner inicial</Label>
        <Textarea id="heroSubtitle" name="heroSubtitle" rows={2} required defaultValue={heroSubtitle} />
      </div>
      <div>
        <Label htmlFor="heroCtaLabel">Texto do botão principal</Label>
        <Input id="heroCtaLabel" name="heroCtaLabel" required defaultValue={heroCtaLabel} />
      </div>
      <div>
        <Label htmlFor="curationText">Texto sobre a curadoria (seção da home)</Label>
        <Textarea id="curationText" name="curationText" rows={4} required defaultValue={curationText} />
      </div>
      {state.status === "idle" && state.message && <p className="text-sm font-medium text-brand-700">{state.message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar configurações"}
      </Button>
    </form>
  );
}
