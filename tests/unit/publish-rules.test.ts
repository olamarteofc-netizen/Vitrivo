import { describe, it, expect } from "vitest";
import { checkProductPublishable, pickPrimaryOffer, sortAlternateOffers } from "@/lib/domain/publish-rules";

const validInput = {
  title: "Produto X",
  slug: "produto-x",
  shortDescription: "Resumo",
  description: "Descrição completa",
  activeOfferCount: 1,
};

describe("checkProductPublishable", () => {
  it("permite publicar quando todos os campos obrigatórios estão presentes e há oferta ativa", () => {
    expect(checkProductPublishable(validInput)).toEqual({ canPublish: true });
  });

  it("bloqueia publicação sem nenhuma oferta ativa", () => {
    const result = checkProductPublishable({ ...validInput, activeOfferCount: 0 });
    expect(result.canPublish).toBe(false);
    if (!result.canPublish) {
      expect(result.reasons.some((r) => r.toLowerCase().includes("oferta"))).toBe(true);
    }
  });

  it("bloqueia publicação com título vazio", () => {
    const result = checkProductPublishable({ ...validInput, title: "  " });
    expect(result.canPublish).toBe(false);
  });

  it("acumula múltiplos motivos quando vários campos estão inválidos", () => {
    const result = checkProductPublishable({
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      activeOfferCount: 0,
    });
    expect(result.canPublish).toBe(false);
    if (!result.canPublish) {
      expect(result.reasons.length).toBe(5);
    }
  });
});

type Offer = { id: string; isPrimary: boolean; active: boolean; position: number };

describe("pickPrimaryOffer", () => {
  it("escolhe a oferta marcada como principal entre as ativas", () => {
    const offers: Offer[] = [
      { id: "a", isPrimary: false, active: true, position: 0 },
      { id: "b", isPrimary: true, active: true, position: 1 },
    ];
    expect(pickPrimaryOffer(offers)?.id).toBe("b");
  });

  it("ignora ofertas inativas mesmo se marcadas como principal", () => {
    const offers: Offer[] = [
      { id: "a", isPrimary: true, active: false, position: 0 },
      { id: "b", isPrimary: false, active: true, position: 1 },
    ];
    expect(pickPrimaryOffer(offers)?.id).toBe("b");
  });

  it("usa a de menor posição quando nenhuma está marcada como principal", () => {
    const offers: Offer[] = [
      { id: "a", isPrimary: false, active: true, position: 2 },
      { id: "b", isPrimary: false, active: true, position: 0 },
    ];
    expect(pickPrimaryOffer(offers)?.id).toBe("b");
  });

  it("retorna undefined quando não há ofertas ativas", () => {
    const offers: Offer[] = [{ id: "a", isPrimary: true, active: false, position: 0 }];
    expect(pickPrimaryOffer(offers)).toBeUndefined();
  });
});

describe("sortAlternateOffers", () => {
  it("exclui a oferta principal e ofertas inativas, ordenando por posição", () => {
    const offers: Offer[] = [
      { id: "a", isPrimary: false, active: true, position: 2 },
      { id: "b", isPrimary: true, active: true, position: 0 },
      { id: "c", isPrimary: false, active: true, position: 1 },
      { id: "d", isPrimary: false, active: false, position: 0 },
    ];
    const result = sortAlternateOffers(offers, "b");
    expect(result.map((o) => o.id)).toEqual(["c", "a"]);
  });
});
