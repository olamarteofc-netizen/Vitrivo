"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
};

/**
 * Botão de submit dentro de um <form> que exige confirmação explícita antes
 * de disparar a ação (usado para arquivar, excluir e outras ações
 * destrutivas). Usa <dialog> nativo — acessível e sem dependências extras.
 */
export function ConfirmSubmitButton({
  confirmTitle,
  confirmDescription,
  confirmLabel = "Confirmar",
  variant = "danger",
  size,
  children,
  ...props
}: Props) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        ref={buttonRef}
        onClick={() => dialogRef.current?.showModal()}
        {...props}
      >
        {children}
      </Button>
      <dialog
        ref={dialogRef}
        className="w-full max-w-sm rounded-2xl border border-border p-0 backdrop:bg-ink-900/40"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="p-5">
          <h2 className="font-display text-lg font-semibold text-ink-900">{confirmTitle}</h2>
          <p className="mt-2 text-sm text-ink-600">{confirmDescription}</p>
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => dialogRef.current?.close()}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={variant}
              onClick={() => {
                dialogRef.current?.close();
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
