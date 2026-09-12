import { test, expect } from "@playwright/test";
import {
  E2E_PUBLISHED_PRODUCT_SLUG,
  E2E_PUBLISHED_PRODUCT_TITLE,
  E2E_MARKETPLACE_ALLOWED_HOST,
} from "./fixtures";

test.describe("Visitante — catálogo e produto", () => {
  test("a home carrega com o nome do site", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/VITRIVO/);
  });

  test("visitante encontra o produto publicado e vê a oferta", async ({ page }) => {
    await page.goto(`/produto/${E2E_PUBLISHED_PRODUCT_SLUG}`);
    await expect(page.getByRole("heading", { name: E2E_PUBLISHED_PRODUCT_TITLE })).toBeVisible();
    await expect(page.getByText("Marketplace E2E")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver produto" })).toBeVisible();
  });

  test("o CTA 'Ver produto' aponta para a rota interna de redirecionamento", async ({ page }) => {
    await page.goto(`/produto/${E2E_PUBLISHED_PRODUCT_SLUG}`);
    const cta = page.getByRole("link", { name: "Ver produto" });
    const href = await cta.getAttribute("href");
    expect(href).toContain("/sair/");
  });

  test("a rota de saída registra o clique e redireciona para o destino validado, sem expor URL arbitrária", async ({
    request,
  }) => {
    const response = await request.get("/sair/e2e-offer-fixed-id", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    const location = response.headers()["location"];
    expect(location).toContain(E2E_MARKETPLACE_ALLOWED_HOST);
  });

  test("oferta inexistente não expõe redirecionamento aberto", async ({ request }) => {
    const response = await request.get("/sair/id-que-nao-existe", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    const location = response.headers()["location"];
    expect(location).toContain("/oferta-indisponivel");
  });

  test("produto inexistente retorna 404", async ({ page }) => {
    const response = await page.goto("/produto/nao-existe-nada-aqui-123");
    expect(response?.status()).toBe(404);
  });

  test("rota totalmente desconhecida retorna 404", async ({ page }) => {
    const response = await page.goto("/esta-rota-nao-existe");
    expect(response?.status()).toBe(404);
  });

  test("páginas legais estão acessíveis", async ({ page }) => {
    await page.goto("/politica-de-privacidade");
    await expect(page.getByRole("heading", { name: "Política de Privacidade" })).toBeVisible();
  });

  test("catálogo lista o produto publicado", async ({ page }) => {
    await page.goto("/produtos");
    await expect(page.getByText(E2E_PUBLISHED_PRODUCT_TITLE)).toBeVisible();
  });

  test("busca encontra o produto pelo título", async ({ page }) => {
    await page.goto("/buscar?q=Publicado+E2E");
    await expect(page.getByText(E2E_PUBLISHED_PRODUCT_TITLE)).toBeVisible();
  });
});
