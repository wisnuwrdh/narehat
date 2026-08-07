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

export async function uploadPhotoWithThumb(
  key: string,
  buffer: Uint8Array | Buffer,
  contentType: string,
  thumbBuffer?: Uint8Array | Buffer
): Promise<string> {
  const env = getCloudflareContext().env as any;
  const putFull = env.R2_BUCKET.put(key, buffer, {
    httpMetadata: { contentType },
  });
  let putThumb = Promise.resolve();
  if (thumbBuffer && thumbBuffer.length > 0) {
    putThumb = env.R2_BUCKET.put(thumbKeyFor(key), thumbBuffer, {
      httpMetadata: { contentType },
    });
  }
  await Promise.all([putFull, putThumb]);
  return `/api/photos/serve?key=${encodeURIComponent(key)}`;
}

export async function deletePhoto(url: string): Promise<void> {
  const key = extractKeyFromUrl(url);
  if (!key) return;
  const env = getCloudflareContext().env as any;
  await Promise.all([
    env.R2_BUCKET.delete(key),
    env.R2_BUCKET.delete(thumbKeyFor(key)).catch(() => {}),
  ]);
}

export async function deletePhotos(urls: string[]): Promise<void> {
  const env = getCloudflareContext().env as any;
  await Promise.all(
    urls.map((url) => {
      const key = extractKeyFromUrl(url);
      if (!key) return Promise.resolve();
      return Promise.all([
        env.R2_BUCKET.delete(key),
        env.R2_BUCKET.delete(thumbKeyFor(key)).catch(() => {}),
      ]);
    })
  );
}

export function thumbKeyFor(key: string): string {
  return `${key}.thumb`;
}

export function extractKeyFromUrl(url: string): string | null {
  if (url.startsWith("/api/photos/serve?key=")) {
    return decodeURIComponent(url.slice("/api/photos/serve?key=".length));
  }
  return null;
}