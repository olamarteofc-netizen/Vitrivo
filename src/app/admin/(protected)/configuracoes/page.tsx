import { getSettings, HERO_TITLE_KEY, HERO_SUBTITLE_KEY, HERO_CTA_LABEL_KEY, CURATION_TEXT_KEY } from "@/lib/services/site-settings";
import { listContactMessages } from "@/lib/services/contact";
import { siteConfig } from "@/config/site";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { SettingsForm } from "./settings-form";
import { markMessageReadAction } from "./actions";

export const metadata = { title: "Configurações" };

export default async function AdminSettingsPage() {
  const [settings, messages] = await Promise.all([
    getSettings([HERO_TITLE_KEY, HERO_SUBTITLE_KEY, HERO_CTA_LABEL_KEY, CURATION_TEXT_KEY]),
    listContactMessages(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Configurações</h1>
        <p className="mt-1 text-sm text-ink-500">Conteúdo editável da home e referência da identidade da marca.</p>
      </div>

      <Card>
        <CardBody>
          <CardTitle>Banner inicial e curadoria</CardTitle>
          <div className="mt-4">
            <SettingsForm
              heroTitle={settings[HERO_TITLE_KEY]}
              heroSubtitle={settings[HERO_SUBTITLE_KEY]}
              heroCtaLabel={settings[HERO_CTA_LABEL_KEY]}
              curationText={settings[CURATION_TEXT_KEY]}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CardTitle>Identidade da marca (somente leitura)</CardTitle>
          <p className="mt-1 text-sm text-ink-500">
            Estes valores vêm de variáveis de ambiente. Para alterá-los, edite o arquivo <code>.env</code> (ou as
            variáveis de ambiente do provedor de deploy) e reinicie a aplicação.
          </p>
          <dl className="mt-4 divide-y divide-border text-sm">
            {[
              ["Nome do site", siteConfig.name],
              ["Slogan", siteConfig.slogan],
              ["URL", siteConfig.url],
              ["E-mail de contato", siteConfig.contactEmail],
              ["Google Analytics", siteConfig.analytics.gaId ? "configurado" : "não configurado"],
              ["Meta Pixel", siteConfig.analytics.metaPixelId ? "configurado" : "não configurado"],
              ["TikTok Pixel", siteConfig.analytics.tiktokPixelId ? "configurado" : "não configurado"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2">
                <dt className="text-ink-500">{label}</dt>
                <dd className="text-right font-medium text-ink-800">{value}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      <Card id="mensagens">
        <CardBody>
          <CardTitle>Mensagens de contato</CardTitle>
          {messages.length > 0 ? (
            <ul className="mt-4 divide-y divide-border">
              {messages.map((message) => (
                <li key={message.id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-ink-900">
                        {message.name} <span className="font-normal text-ink-400">· {message.email}</span>
                      </p>
                      <p className="text-xs text-ink-400">{formatDate(message.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!message.read && <Badge tone="accent">Nova</Badge>}
                      <form action={markMessageReadAction.bind(null, message.id, !message.read)}>
                        <button type="submit" className="text-xs font-medium text-brand-700 hover:underline">
                          {message.read ? "Marcar como não lida" : "Marcar como lida"}
                        </button>
                      </form>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-ink-700">{message.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink-500">Nenhuma mensagem recebida ainda.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
