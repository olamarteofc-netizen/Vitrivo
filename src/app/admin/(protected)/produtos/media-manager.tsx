"use client";

import { ArrowUp, ArrowDown, Trash2, ImageOff } from "lucide-react";
import { Input, Select, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { addMediaAction, removeMediaAction, moveMediaAction } from "./actions";

type MediaItem = { id: string; type: string; url: string; altText: string | null };

export function MediaManager({ productId, media }: { productId: string; media: MediaItem[] }) {
  return (
    <div className="space-y-4">
      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media.map((item, index) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="aspect-square bg-ink-50">
                {item.type === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.altText ?? ""} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-300">
                    <ImageOff className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex gap-1">
                  <form action={moveMediaAction.bind(null, productId, item.id, "up")}>
                    <button type="submit" disabled={index === 0} className="text-ink-400 hover:text-ink-700 disabled:opacity-30">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </form>
                  <form action={moveMediaAction.bind(null, productId, item.id, "down")}>
                    <button type="submit" disabled={index === media.length - 1} className="text-ink-400 hover:text-ink-700 disabled:opacity-30">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </form>
                </div>
                <form action={removeMediaAction.bind(null, item.id, productId)}>
                  <button type="submit" className="text-danger-500 hover:text-danger-700" aria-label="Remover mídia">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <form action={addMediaAction.bind(null, productId)} className="grid gap-3 rounded-xl border border-dashed border-border p-4 sm:grid-cols-4">
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
    </div>
  );
}
