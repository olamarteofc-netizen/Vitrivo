"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { ArrowUp, ArrowDown, Trash2, ImageOff, Star, UploadCloud } from "lucide-react";
import { Input, Select, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import {
  addMediaAction,
  removeMediaAction,
  moveMediaAction,
  setCoverMediaAction,
  updateMediaAltAction,
} from "./actions";

type MediaItem = { id: string; type: string; url: string; altText: string | null };

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export function MediaManager({ productId, media }: { productId: string; media: MediaItem[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<{ name: string; progress: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`"${file.name}" não é um formato aceito (use JPG, PNG ou WEBP).`);
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError(`"${file.name}" excede o limite de 8 MB.`);
        continue;
      }

      setUploads((prev) => [...prev, { name: file.name, progress: 0 }]);
      try {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/admin/media/upload",
          onUploadProgress: ({ percentage }) => {
            setUploads((prev) => prev.map((u) => (u.name === file.name ? { ...u, progress: percentage } : u)));
          },
        });

        const formData = new FormData();
        formData.set("type", "IMAGE");
        formData.set("url", blob.url);
        formData.set("altText", "");
        await addMediaAction(productId, formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Falha ao enviar "${file.name}".`);
      } finally {
        setUploads((prev) => prev.filter((u) => u.name !== file.name));
      }
    }

    router.refresh();
  }

  return (
    <div className="space-y-4">
      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media.map((item, index) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="relative aspect-square bg-ink-50">
                {index === 0 && (
                  <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Capa
                  </span>
                )}
                {item.type === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.altText ?? ""} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-300">
                    <ImageOff className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5 p-2">
                <form action={updateMediaAltAction.bind(null, item.id, productId)}>
                  <input
                    type="text"
                    name="altText"
                    defaultValue={item.altText ?? ""}
                    placeholder="Texto alternativo"
                    onBlur={(e) => e.currentTarget.form?.requestSubmit()}
                    className="w-full rounded-md border border-border bg-transparent px-1.5 py-1 text-xs text-ink-700"
                  />
                </form>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <form action={moveMediaAction.bind(null, productId, item.id, "up")}>
                      <button
                        type="submit"
                        disabled={index === 0}
                        aria-label="Mover para cima"
                        className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    </form>
                    <form action={moveMediaAction.bind(null, productId, item.id, "down")}>
                      <button
                        type="submit"
                        disabled={index === media.length - 1}
                        aria-label="Mover para baixo"
                        className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </form>
                    {index !== 0 && (
                      <form action={setCoverMediaAction.bind(null, productId, item.id)}>
                        <button
                          type="submit"
                          aria-label="Definir como capa"
                          title="Definir como capa"
                          className="text-ink-400 hover:text-brand-700"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      </form>
                    )}
                  </div>
                  <form action={removeMediaAction.bind(null, item.id, productId)}>
                    <ConfirmSubmitButton
                      variant="ghost"
                      size="sm"
                      confirmTitle="Remover mídia"
                      confirmDescription="Esta imagem será removida do produto. Essa ação não pode ser desfeita."
                      confirmLabel="Remover"
                      aria-label="Remover mídia"
                    >
                      <Trash2 className="h-4 w-4 text-danger-500" />
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-dashed border-border p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <UploadCloud className="mr-1.5 h-4 w-4" />
          Enviar imagens
        </Button>
        <p className="mt-1.5 text-xs text-ink-400">
          JPG, PNG ou WEBP — até 8 MB por arquivo. Você pode selecionar várias imagens de uma vez.
        </p>

        {uploads.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {uploads.map((u) => (
              <li key={u.name} className="text-xs text-ink-500">
                Enviando {u.name}… {u.progress}%
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full bg-brand-600 transition-all" style={{ width: `${u.progress}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
        {error && <p className="mt-2 text-xs text-danger-600">{error}</p>}
      </div>

      <details className="rounded-xl border border-border p-4">
        <summary className="cursor-pointer text-sm font-medium text-ink-600">
          Adicionar por URL externa (opcional)
        </summary>
        <form
          action={addMediaAction.bind(null, productId)}
          className="mt-3 grid gap-3 sm:grid-cols-4"
        >
          <div>
            <Label htmlFor="media-type">Tipo</Label>
            <Select id="media-type" name="type" defaultValue="IMAGE">
              <option value="IMAGE">Imagem</option>
              <option value="VIDEO">Vídeo</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="media-url">URL</Label>
            <Input id="media-url" name="url" type="url" required placeholder="https://…" />
          </div>
          <div>
            <Label htmlFor="media-alt">Texto alternativo</Label>
            <Input id="media-alt" name="altText" />
          </div>
          <div className="sm:col-span-4">
            <Button type="submit" size="sm" variant="outline">
              Adicionar mídia
            </Button>
          </div>
        </form>
      </details>
    </div>
  );
}
