import { encode } from "@jsquash/webp";

const MAX_WIDTH = 1600;
const TARGET_QUALITY = 0.75;

async function resizeImageData(
  imageData: ImageData,
  maxWidth: number
): Promise<ImageData> {
  const srcW = imageData.width;
  const srcH = imageData.height;

  if (srcW <= maxWidth) return imageData;

  const ratio = maxWidth / srcW;
  const dstW = maxWidth;
  const dstH = Math.round(srcH * ratio);

  const src = imageData.data;
  const dst = new Uint8ClampedArray(dstW * dstH * 4);

  for (let y = 0; y < dstH; y++) {
    const srcY = (y / ratio) | 0;
    for (let x = 0; x < dstW; x++) {
      const srcX = (x / ratio) | 0;
      const si = (srcY * srcW + srcX) * 4;
      const di = (y * dstW + x) * 4;
      dst[di] = src[si];
      dst[di + 1] = src[si + 1];
      dst[di + 2] = src[si + 2];
      dst[di + 3] = src[si + 3];
    }
  }

  return { data: dst, width: dstW, height: dstH, colorSpace: imageData.colorSpace };
}

function getImageDataFromInput(input: Uint8Array): Promise<ImageData> {
  try {
    const blob = new Blob([input.buffer as ArrayBuffer]);
    return createImageBitmap(blob).then((bitmap) => {
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("OffscreenCanvas 2d context unavailable");
      ctx.drawImage(bitmap as unknown as CanvasImageSource, 0, 0);
      return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    });
  } catch {
    return decodeImageViaJSquash(input);
  }
}

async function decodeImageViaJSquash(input: Uint8Array): Promise<ImageData> {
  const { decode } = await import("@jsquash/webp");
  const data = await decode(input);
  return new ImageData(
    new Uint8ClampedArray(data.data),
    data.width,
    data.height
  );
}

export async function compressToWebP(
  buffer: Uint8Array,
  options?: { maxWidth?: number; quality?: number }
): Promise<Uint8Array> {
  const maxWidth = options?.maxWidth ?? MAX_WIDTH;
  const quality = options?.quality ?? TARGET_QUALITY;

  try {
    const imageData = await getImageDataFromInput(buffer);
    const resized = await resizeImageData(imageData, maxWidth);
    const encoded = await encode(resized, { quality });
    return new Uint8Array(encoded);
  } catch (err) {
    console.warn("Image compression failed, returning original:", err);
    return buffer;
  }
}

export async function compressAndGetSize(
  buffer: Uint8Array
): Promise<{ compressed: Uint8Array; originalSize: number; compressedSize: number }> {
  const compressed = await compressToWebP(buffer);
  return {
    compressed,
    originalSize: buffer.length,
    compressedSize: compressed.length,
  };
}
