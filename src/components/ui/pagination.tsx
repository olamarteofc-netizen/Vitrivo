import Link from "next/link";
import { cn } from "@/lib/cn";

function buildHref(basePath: string, searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({
  page,
  pageCount,
  basePath,
  searchParams = {},
}: {
  page: number;
  pageCount: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= pageCount;

  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pageCount || Math.abs(n - page) <= 1,
  );

  return (
    <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-1">
      <PageLink
        href={buildHref(basePath, searchParams, page - 1)}
        disabled={prevDisabled}
        aria-label="Página anterior"
      >
        ‹
      </PageLink>
      {pageNumbers.map((n, i) => {
        const prev = pageNumbers[i - 1];
        const showEllipsis = prev !== undefined && n - prev > 1;
        return (
          <span key={n} className="flex items-center gap-1">
            {showEllipsis && <span className="px-1 text-ink-400">…</span>}
            <PageLink href={buildHref(basePath, searchParams, n)} active={n === page}>
              {n}
            </PageLink>
          </span>
        );
      })}
      <PageLink
        href={buildHref(basePath, searchParams, page + 1)}
        disabled={nextDisabled}
        aria-label="Próxima página"
      >
        ›
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...props
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (disabled) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-ink-300" aria-hidden>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
        active ? "bg-brand-700 text-white" : "text-ink-700 hover:bg-ink-100",
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
