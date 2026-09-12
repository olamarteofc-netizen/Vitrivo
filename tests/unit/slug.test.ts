import { describe, it, expect } from "vitest";
import { slugify, slugifyOrFallback, uniqueSlug } from "@/lib/slug";

describe("slugify", () => {
  it("converte para minúsculas e troca espaços por hífen", () => {
    expect(slugify("Produto Incrível")).toBe("produto-incrivel");
  });

  it("remove acentos", () => {
    expect(slugify("Difusor de Aromas Compacto")).toBe("difusor-de-aromas-compacto");
    expect(slugify("Ação Promoção")).toBe("acao-promocao");
  });

  it("remove caracteres especiais", () => {
    expect(slugify("Produto & Cia! (edição especial)")).toBe("produto-cia-edicao-especial");
  });

  it("colapsa hífens repetidos e remove das pontas", () => {
    expect(slugify("  --produto---teste--  ")).toBe("produto-teste");
  });

  it("retorna string vazia para entrada sem caracteres válidos", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("slugifyOrFallback", () => {
  it("usa o fallback quando o slug fica vazio", () => {
    expect(slugifyOrFallback("!!!", "Produto Padrão")).toBe("produto-padrao");
  });

  it("usa o valor normal quando válido", () => {
    expect(slugifyOrFallback("Produto Teste", "fallback")).toBe("produto-teste");
  });
});

describe("uniqueSlug", () => {
  it("retorna o slug base quando não está em uso", () => {
    expect(uniqueSlug("Produto Novo", () => false)).toBe("produto-novo");
  });

  it("adiciona sufixo numérico incremental até achar um livre", () => {
    const taken = new Set(["produto", "produto-2", "produto-3"]);
    expect(uniqueSlug("Produto", (candidate) => taken.has(candidate))).toBe("produto-4");
  });

  it("usa fallback 'item' para entradas totalmente inválidas", () => {
    expect(uniqueSlug("!!!", () => false)).toBe("item");
  });
});
