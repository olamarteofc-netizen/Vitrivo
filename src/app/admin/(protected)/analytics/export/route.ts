import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/session";
import { exportClicksCsv, type AnalyticsRange } from "@/lib/services/analytics";

const VALID_RANGES: AnalyticsRange[] = ["7d", "30d", "90d", "all"];

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const rangeParam = request.nextUrl.searchParams.get("range");
  const range: AnalyticsRange = VALID_RANGES.includes(rangeParam as AnalyticsRange)
    ? (rangeParam as AnalyticsRange)
    : "30d";

  const csv = await exportClicksCsv(range);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cliques-${range}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
