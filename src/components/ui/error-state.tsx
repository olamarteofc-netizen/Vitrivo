import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Algo deu errado",
  description = "Não foi possível carregar esta informação agora. Tente novamente em instantes.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-danger-100 bg-danger-50 px-6 py-16 text-center">
      <h3 className="font-display text-lg font-semibold text-danger-700">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-danger-600">{description}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
