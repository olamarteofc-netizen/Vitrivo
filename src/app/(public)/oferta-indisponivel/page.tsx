import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Oferta indisponível", robots: { index: false, follow: false } };

export default function OfferUnavailablePage() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-24 text-center">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Esta oferta não está mais disponível</h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        O link pode ter expirado, sido desativado ou o produto foi removido da vitrine. Confira outras opções no
        catálogo.
      </p>
      <LinkButton href="/produtos" className="mt-6">
        Ver catálogo
      </LinkButton>
    </div>
  );
}
