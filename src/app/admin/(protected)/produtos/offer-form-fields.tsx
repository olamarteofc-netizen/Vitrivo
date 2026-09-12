import { Input, Select, Label, CheckboxField, FieldHint } from "@/components/ui/field";

export type MarketplaceOption = { id: string; name: string };

export type OfferDefaults = {
  marketplaceId: string;
  destinationUrl: string;
  affiliateUrl: string;
  referencePrice: number | null;
  currency: string;
  label: string | null;
  notes: string | null;
  isPrimary: boolean;
  active: boolean;
};

export function OfferFormFields({
  marketplaces,
  defaults,
  idPrefix,
}: {
  marketplaces: MarketplaceOption[];
  defaults?: OfferDefaults;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <Label htmlFor={`${idPrefix}-marketplaceId`}>Marketplace</Label>
        <Select id={`${idPrefix}-marketplaceId`} name="marketplaceId" required defaultValue={defaults?.marketplaceId ?? ""}>
          <option value="" disabled>
            Selecione
          </option>
          {marketplaces.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-referencePrice`}>Preço de referência (opcional)</Label>
        <Input
          id={`${idPrefix}-referencePrice`}
          name="referencePrice"
          type="number"
          min={0}
          step="0.01"
          defaultValue={defaults?.referencePrice ?? ""}
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-destinationUrl`}>URL do produto no marketplace</Label>
        <Input id={`${idPrefix}-destinationUrl`} name="destinationUrl" type="url" required defaultValue={defaults?.destinationUrl} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-affiliateUrl`}>URL de afiliado (usada no redirecionamento)</Label>
        <Input id={`${idPrefix}-affiliateUrl`} name="affiliateUrl" type="url" required defaultValue={defaults?.affiliateUrl} />
        <FieldHint>Deve ser HTTPS e pertencer a um domínio liberado para o marketplace selecionado.</FieldHint>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-currency`}>Moeda</Label>
        <Input id={`${idPrefix}-currency`} name="currency" maxLength={3} defaultValue={defaults?.currency ?? "BRL"} />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-label`}>Rótulo (opcional)</Label>
        <Input id={`${idPrefix}-label`} name="label" defaultValue={defaults?.label ?? ""} placeholder="Ex.: Frete grátis" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-notes`}>Observações internas (opcional)</Label>
        <Input id={`${idPrefix}-notes`} name="notes" defaultValue={defaults?.notes ?? ""} />
      </div>
      <div className="flex items-center gap-4 sm:col-span-2">
        <CheckboxField name="isPrimary" label="Oferta principal" defaultChecked={defaults?.isPrimary} />
        <CheckboxField name="active" label="Ativa" defaultChecked={defaults?.active ?? true} />
      </div>
    </div>
  );
}
