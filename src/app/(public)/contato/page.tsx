import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { siteConfig, LEGAL_CONTACT_NOTE } from "@/config/site";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { Card, CardBody } from "@/components/ui/card";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contato" };

export default function ContactPage() {
  return (
    <div className="container-page max-w-3xl py-10">
      <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Contato" }]} />
      <h1 className="font-display text-3xl font-bold text-ink-900">Fale com a gente</h1>
      <p className="mt-2 text-sm text-ink-500">{LEGAL_CONTACT_NOTE}</p>

      <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_1.3fr]">
        <Card className="h-fit">
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-ink-700">
              <Mail className="h-4 w-4 text-brand-700" />
              <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-brand-700">
                {siteConfig.contactEmail}
              </a>
            </div>
          </CardBody>
        </Card>

        <ContactForm />
      </div>
    </div>
  );
}
