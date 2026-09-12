import { Search } from "lucide-react";

export function SearchBar({ className, defaultValue }: { className?: string; defaultValue?: string }) {
  return (
    <form action="/buscar" method="GET" role="search" className={className}>
      <label htmlFor="site-search" className="sr-only">
        Buscar produtos
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          id="site-search"
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Buscar produtos…"
          className="h-10 w-full rounded-full border border-border bg-surface pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:outline-brand-600"
        />
      </div>
    </form>
  );
}
