import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-6xl font-bold text-brand-700">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">Página não encontrada</h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        O endereço acessado não existe ou o produto pode ter sido removido da vitrine.
      </p>
      <div className="mt-6 flex gap-3">
        <LinkButton href="/">Voltar ao início</LinkButton>
        <Link
          href="/produtos"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-ink-700 hover:bg-ink-100"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
