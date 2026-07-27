/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function uploadPhoto(
  key: string,
  buffer: Uint8Array | Buffer,
  contentType: string
): Promise<string> {
  const env = getCloudflareContext().env as any;
  await env.R2_BUCKET.put(key, buffer, {
    httpMetadata: { contentType },
  });
  return `/api/photos/serve?key=${encodeURIComponent(key)}`;
}

export async function deletePhoto(url: string): Promise<void> {
  const key = extractKeyFromUrl(url);
  if (!key) return;
  const env = getCloudflareContext().env as any;
  await env.R2_BUCKET.delete(key);
}

export async function deletePhotos(urls: string[]): Promise<void> {
  const env = getCloudflareContext().env as any;
  await Promise.all(
    urls.map((url) => {
      const key = extractKeyFromUrl(url);
      if (!key) return Promise.resolve();
      return env.R2_BUCKET.delete(key);
    })
  );
}

function extractKeyFromUrl(url: string): string | null {
  if (url.startsWith("/api/photos/serve?key=")) {
    return decodeURIComponent(url.slice("/api/photos/serve?key=".length));
  }
  return null;
}