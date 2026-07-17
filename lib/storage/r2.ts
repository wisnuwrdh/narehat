import { S3Client, PutObjectCommand, DeleteObjectCommand, type PutObjectCommandInput } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

function getClient(): S3Client {
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT) {
    throw new Error("R2 credentials not configured");
  }
  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

function getBucket(): string {
  if (!R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME not configured");
  return R2_BUCKET_NAME;
}

export function getPublicUrl(key: string): string {
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
  return `${R2_ENDPOINT}/${getBucket()}/${key}`;
}

function extractKeyFromUrl(url: string): string | null {
  if (R2_PUBLIC_URL) {
    const prefix = R2_PUBLIC_URL.replace(/\/$/, "") + "/";
    if (url.startsWith(prefix)) return url.slice(prefix.length);
  }
  const bucketPrefix = `${R2_ENDPOINT}/${getBucket()}/`;
  if (url.includes(bucketPrefix)) return url.split(bucketPrefix)[1];
  return null;
}

export async function uploadPhoto(
  key: string,
  buffer: Uint8Array | Buffer,
  contentType: string
): Promise<string> {
  const client = getClient();
  const bucket = getBucket();

  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    } satisfies PutObjectCommandInput,
  });

  await upload.done();
  return getPublicUrl(key);
}

export async function deletePhoto(url: string): Promise<void> {
  const key = extractKeyFromUrl(url);
  if (!key) return;

  const client = getClient();
  const bucket = getBucket();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export async function deletePhotos(urls: string[]): Promise<void> {
  const client = getClient();
  const bucket = getBucket();

  await Promise.all(
    urls.map((url) => {
      const key = extractKeyFromUrl(url);
      if (!key) return Promise.resolve();
      return client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );
    })
  );
}
