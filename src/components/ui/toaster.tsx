"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      toastOptions={{
        style: {
          fontFamily: "var(--font-sans)",
          borderRadius: "0.875rem",
        },
      }}
    />
  );
}
