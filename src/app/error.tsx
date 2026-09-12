"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center justify-center py-24 text-center">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Algo deu errado</h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        Não foi possível carregar esta página agora. Você pode tentar novamente.
      </p>
      <Button className="mt-6" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
