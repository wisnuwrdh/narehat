import { getCloudflareContext } from "@opennextjs/cloudflare";

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";
const R2_ENDPOINT = process.env.R2_ENDPOINT || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";

export function getPublicUrl(key: string): string {
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
  return `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`;
}

function extractKeyFromUrl(url: string): string | null {
  if (R2_PUBLIC_URL) {
    const prefix = R2_PUBLIC_URL.replace(/\/$/, "") + "/";
    if (url.startsWith(prefix)) return url.slice(prefix.length);
  }
  const prefix = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/`;
  if (url.includes(prefix)) return url.split(prefix)[1];
  return null;
}

export async function uploadPhoto(
  key: string,
  buffer: Uint8Array | Buffer,
  contentType: string
): Promise<string> {
  const { env } = getCloudflareContext();
  await env.R2_BUCKET.put(key, buffer, {
    httpMetadata: { contentType },
  });
  return getPublicUrl(key);
}

export async function deletePhoto(url: string): Promise<void> {
  const key = extractKeyFromUrl(url);
  if (!key) return;
  const { env } = getCloudflareContext();
  await env.R2_BUCKET.delete(key);
}

export async function deletePhotos(urls: string[]): Promise<void> {
  const { env } = getCloudflareContext();
  await Promise.all(
    urls.map((url) => {
      const key = extractKeyFromUrl(url);
      if (!key) return Promise.resolve();
      return env.R2_BUCKET.delete(key);
    })
  );
}