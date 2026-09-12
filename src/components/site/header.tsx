import Link from "next/link";
import { siteConfig } from "@/config/site";
import { listActiveCategories } from "@/lib/services/categories";
import { SearchBar } from "@/components/site/search-bar";
import { MobileNav } from "@/components/site/mobile-nav";

export async function Header() {
  const categories = await listActiveCategories();

  const links = [
    { href: "/produtos", label: "Produtos" },
    ...(siteConfig.features.guides ? [{ href: "/guias", label: "Guias" }] : []),
    { href: "/sobre", label: "Sobre" },
    { href: "/contato", label: "Contato" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-ink-900">
          {siteConfig.name}
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
          {categories.length > 0 && (
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100">
                Categorias
              </summary>
              <div className="absolute left-0 top-full z-40 mt-1 w-56 rounded-xl border border-border bg-surface p-2 shadow-elevated">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categoria/${category.slug}`}
                    className="block rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-100"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </details>
          )}
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden w-64 md:block">
          <SearchBar />
        </div>

        <MobileNav
          links={[
            ...categories.map((c) => ({ href: `/categoria/${c.slug}`, label: c.name })),
            ...links,
          ]}
        />
      </div>
    </header>
  );
}
