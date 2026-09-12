import * as React from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "accent" | "danger" | "success";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700",
  brand: "bg-brand-100 text-brand-800",
  accent: "bg-accent-100 text-accent-800",
  danger: "bg-danger-100 text-danger-700",
  success: "bg-brand-100 text-brand-800",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
