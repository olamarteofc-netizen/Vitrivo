import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { getOfferForRedirect } from "@/lib/services/offers";
import { recordOutboundClick } from "@/lib/services/analytics";
import { parseAllowedHosts, validateAffiliateUrl, classifyDevice } from "@/lib/redirect/allowlist";
import { getExtraAllowedHosts, getServerEnv } from "@/config/env";
import { deserializeUtm } from "@/lib/utm";
import { UTM_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 dias

function hashSessionId(rawId: string): string {
  const secret = getServerEnv().NEXTAUTH_SECRET;
  return crypto.createHmac("sha256", secret).update(rawId).digest("hex");
}

function unavailableResponse(request: NextRequest): NextResponse {
  const url = new URL("/oferta-indisponivel", request.url);
  const response = NextResponse.redirect(url, { status: 307 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;

  if (!offerId || offerId.length < 5) {
    return unavailableResponse(request);
  }

  const offer = await getOfferForRedirect(offerId);
  if (!offer || !offer.active || offer.product.status !== "PUBLISHED" || !offer.marketplace.active) {
    return unavailableResponse(request);
  }

  const allowedHosts = [...parseAllowedHosts(offer.marketplace.allowedHosts), ...getExtraAllowedHosts()];
  const destinationCheck = validateAffiliateUrl(offer.affiliateUrl, allowedHosts);
  if (!destinationCheck.ok) {
    console.error(
      `[redirect] destino bloqueado para oferta ${offer.id}: ${destinationCheck.reason}`,
    );
    return unavailableResponse(request);
  }

  const existingSid = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const rawSessionId = existingSid ?? crypto.randomUUID();

  const fromParam = request.nextUrl.searchParams.get("from");
  const referrerHeader = request.headers.get("referer");
  let landingPath: string | null = fromParam;
  if (!landingPath && referrerHeader) {
    try {
      const referrerUrl = new URL(referrerHeader);
      if (referrerUrl.origin === request.nextUrl.origin) {
        landingPath = referrerUrl.pathname;
      }
    } catch {
      landingPath = null;
    }
  }

  const utmCookie = request.cookies.get(UTM_COOKIE_NAME)?.value;
  const utm = deserializeUtm(utmCookie);

  try {
    await recordOutboundClick({
      offerId: offer.id,
      productId: offer.productId,
      sessionId: hashSessionId(rawSessionId),
      referrer: referrerHeader,
      landingPath,
      deviceClass: classifyDevice(request.headers.get("user-agent")),
      utm,
    });
  } catch (error) {
    console.error("[redirect] falha ao registrar clique", error);
  }

  const response = NextResponse.redirect(destinationCheck.url, { status: 307 });
  response.headers.set("Cache-Control", "no-store");
  if (!existingSid) {
    response.cookies.set(SESSION_COOKIE_NAME, rawSessionId, {
      maxAge: SESSION_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }
  return response;
}
