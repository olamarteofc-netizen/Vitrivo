import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-ink-500">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-300" aria-hidden />}
          {item.href ? (
            <Link href={item.href} className="hover:text-ink-900">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-ink-800">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
