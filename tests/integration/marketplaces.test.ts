import { describe, it, expect } from "vitest";
import { listActiveMarketplaces } from "@/lib/services/marketplaces";
import { MARKETPLACE_BOOTSTRAP } from "@/lib/domain/marketplace-bootstrap";

describe("marketplaces estruturais (bootstrap idempotente)", () => {
  it("Mercado Livre e Shopee aparecem entre os marketplaces ativos (causa raiz do select vazio)", async () => {
    const marketplaces = await listActiveMarketplaces();
    const names = marketplaces.map((m) => m.name);
    expect(names).toContain("Mercado Livre");
    expect(names).toContain("Shopee");
  });

  it("todos os marketplaces estruturais existem com os hosts esperados", async () => {
    const marketplaces = await listActiveMarketplaces();
    for (const def of MARKETPLACE_BOOTSTRAP) {
      const found = marketplaces.find((m) => m.slug === def.slug);
      expect(found, `marketplace "${def.slug}" deveria existir`).toBeTruthy();
      for (const host of def.allowedHosts) {
        expect(found!.allowedHosts).toContain(host);
      }
    }
  });
});
