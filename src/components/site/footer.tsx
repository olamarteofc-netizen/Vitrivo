import Link from "next/link";
import { AtSign, PlaySquare } from "lucide-react";
import { siteConfig, DEFAULT_AFFILIATE_DISCLOSURE } from "@/config/site";

const legalLinks = [
  { href: "/politica-de-privacidade", label: "Política de Privacidade" },
  { href: "/termos-de-uso", label: "Termos de Uso" },
  { href: "/politica-de-cookies", label: "Política de Cookies" },
  { href: "/transparencia-de-afiliados", label: "Transparência de Afiliados" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-ink-950 text-ink-200">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold text-white">{siteConfig.name}</p>
          <p className="mt-2 text-sm text-ink-400">{siteConfig.slogan}</p>
          <div className="mt-4 flex gap-3">
            {siteConfig.social.instagram && (
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Instagram"
                className="text-ink-300 hover:text-white"
              >
                <AtSign className="h-5 w-5" />
              </a>
            )}
            {siteConfig.social.youtube && (
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="YouTube"
                className="text-ink-300 hover:text-white"
              >
                <PlaySquare className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Navegue</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-400">
            <li><Link href="/produtos" className="hover:text-white">Produtos</Link></li>
            <li><Link href="/sobre" className="hover:text-white">Sobre</Link></li>
            <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-400">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Contato</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-400">
            <li>
              <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-white">
                {siteConfig.contactEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. Todos os direitos reservados.
          </p>
          <p className="max-w-2xl">{DEFAULT_AFFILIATE_DISCLOSURE}</p>
        </div>
      </div>
    </footer>
  );
}
