import { Info } from "lucide-react";
import { DEFAULT_AFFILIATE_DISCLOSURE } from "@/config/site";

export function AffiliateDisclosure({ text, className }: { text?: string | null; className?: string }) {
  return (
    <div
      className={
        "flex items-start gap-2 rounded-xl border border-accent-200 bg-accent-50 p-3 text-xs text-accent-900 " +
        (className ?? "")
      }
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p>{text || DEFAULT_AFFILIATE_DISCLOSURE}</p>
    </div>
  );
}
