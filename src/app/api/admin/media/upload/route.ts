import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Gera o token de upload direto para o Vercel Blob (upload client → Blob,
 * sem passar pelo corpo desta função serverless — evita o limite de ~4.5MB
 * de request body do Vercel e permite fotos de celular sem compressão).
 *
 * O registro em `product_media` só é criado depois, pelo client, chamando a
 * server action `addMediaAction` já existente com a URL retornada — mantém
 * uma única fonte de verdade para validação/auditoria de mídia.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getAdminSession();
        if (!session?.user) {
          throw new Error("Não autenticado.");
        }
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_SIZE_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Sem efeito colateral aqui: o client cria o ProductMedia via
        // addMediaAction logo após o upload() resolver.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha no upload." },
      { status: 400 },
    );
  }
}
