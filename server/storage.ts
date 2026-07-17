// Storage na nossa stack: Supabase Storage.
// Interface publica preservada (storagePut, storageGet -> { key, url }).
// Sem credenciais Supabase, falha com mensagem clara.

import { ENV } from "./_core/env";

function getStorageConfig(): { baseUrl: string; apiKey: string; bucket: string } {
  const baseUrl = ENV.supabaseUrl;
  const apiKey = ENV.supabaseServiceKey;
  const bucket = ENV.supabaseBucket;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage do Supabase nao configurado: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey, bucket };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function authHeaders(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}`, apikey: apiKey };
}

function publicUrl(baseUrl: string, bucket: string, key: string): string {
  return `${baseUrl}/storage/v1/object/public/${bucket}/${key}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey, bucket } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = `${baseUrl}/storage/v1/object/${bucket}/${key}`;

  const body =
    typeof data === "string" ? new TextEncoder().encode(data) : data;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      ...authHeaders(apiKey),
      "content-type": contentType,
      "x-upsert": "true",
    },
    body: body as any,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Upload para o Supabase falhou (${response.status} ${response.statusText}): ${message}`
    );
  }

  return { key, url: publicUrl(baseUrl, bucket, key) };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const { baseUrl, bucket } = getStorageConfig();
  const key = normalizeKey(relKey);
  return { key, url: publicUrl(baseUrl, bucket, key) };
}
