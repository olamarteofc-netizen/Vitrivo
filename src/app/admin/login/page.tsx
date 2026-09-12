import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { siteConfig } from "@/config/site";
import { Card, CardBody } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar", robots: { index: false, follow: false } };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getAdminSession();
  const sp = await searchParams;
  const callbackUrl = typeof sp.callbackUrl === "string" ? sp.callbackUrl : "/admin";

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <Card className="w-full max-w-sm">
        <CardBody>
          <p className="font-display text-xl font-bold text-ink-900">{siteConfig.name}</p>
          <p className="mt-1 text-sm text-ink-500">Acesso administrativo</p>
          <div className="mt-6">
            <LoginForm callbackUrl={callbackUrl} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
