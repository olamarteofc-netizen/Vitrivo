"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { track } from "@/lib/analytics/client";

export function ShareButton({ productSlug, title }: { productSlug: string; title: string }) {
  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        track({ name: "share", method: "native", productSlug });
        return;
      } catch {
        // usuário cancelou o compartilhamento nativo — sem ação adicional
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência");
      track({ name: "share", method: "copy", productSlug });
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
    >
      <Share2 className="h-4 w-4" />
      Compartilhar
    </button>
  );
}
