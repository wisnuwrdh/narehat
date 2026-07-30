const MAX_DIMENSION = 1200;
const QUALITY = 0.85;
const MAX_PNG_PIXELS = 6000000;

function imageFromURL(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Format gambar tidak didukung"));
    };
    img.src = url;
  });
}

async function readSignature(file: File, length: number): Promise<Uint8Array> {
  const blob = file.slice(0, length);
  const buf = await blob.arrayBuffer();
  return new Uint8Array(buf);
}

function matches(buf: Uint8Array, pattern: number[], offset: number): boolean {
  for (let i = 0; i < pattern.length; i++) {
    if (buf[offset + i] !== pattern[i]) return false;
  }
  return true;
}

function detectFormat(
  buf: Uint8Array
): { known: true; format: string } | { known: false; reason: "heic" | "avif" | "unknown" } {
  if (buf[0] === 0xff && buf[1] === 0xd8) return { known: true, format: "jpeg" };
  if (matches(buf, [0x89, 0x50, 0x4e, 0x47], 0)) return { known: true, format: "png" };
  if (matches(buf, [0x52, 0x49, 0x46, 0x46], 0)) return { known: true, format: "webp" };
  if (matches(buf, [0x66, 0x74, 0x79, 0x70], 4)) {
    if (matches(buf, [0x68, 0x65], 8)) return { known: false, reason: "heic" };
    if (matches(buf, [0x61, 0x76], 8)) return { known: false, reason: "avif" };
  }
  return { known: false, reason: "unknown" };
}

function readPNGDimensions(buf: Uint8Array): { width: number; height: number } | null {
  if (!matches(buf, [0x49, 0x48, 0x44, 0x52], 12)) return null;
  if (buf.length < 24) return null;
  const width = (buf[16] << 24) | (buf[17] << 16) | (buf[18] << 8) | buf[19];
  const height = (buf[20] << 24) | (buf[21] << 16) | (buf[22] << 8) | buf[23];
  return { width, height };
}

async function decodeImage(file: File): Promise<{
  source: HTMLImageElement | ImageBitmap;
  width: number;
  height: number;
}> {
  const sig = await readSignature(file, 24);
  const detected = detectFormat(sig);

  if (!detected.known) {
    if (detected.reason === "heic") throw new Error("HEIC");
    if (detected.reason === "avif") throw new Error("AVIF");
    throw new Error("Format gambar tidak dikenal");
  }

  if (detected.format === "png") {
    const dims = readPNGDimensions(sig);
    if (dims && dims.width * dims.height > MAX_PNG_PIXELS) {
      throw new Error("PNG resolusi terlalu tinggi");
    }
  }

  try {
    const bitmap = await createImageBitmap(file, {
      resizeWidth: MAX_DIMENSION,
      resizeHeight: MAX_DIMENSION,
      resizeQuality: "high",
    });
    return { source: bitmap, width: bitmap.width, height: bitmap.height };
  } catch {
    const url = URL.createObjectURL(file);
    const img = await imageFromURL(url);
    return { source: img, width: img.naturalWidth, height: img.naturalHeight };
  }
}

function compressToWebP(
  source: HTMLImageElement | ImageBitmap,
  dstW: number,
  dstH: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = dstW;
    canvas.height = dstH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas tidak didukung"));

    try {
      ctx.drawImage(source, 0, 0, dstW, dstH);
    } catch {
      return reject(new Error("Gagal memproses gambar"));
    }

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Gagal mengompres gambar"));
      },
      "image/webp",
      QUALITY
    );
  });
}

export async function compressImageOnClient(file: File): Promise<File> {
  const { source, width, height } = await decodeImage(file);

  let dstW = width;
  let dstH = height;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = MAX_DIMENSION / Math.max(width, height);
    dstW = Math.round(width * ratio);
    dstH = Math.round(height * ratio);
  }

  try {
    const blob = await compressToWebP(source, dstW, dstH);
    const name = file.name.replace(/\.[^.]+$/, ".webp");
    return new File([blob], name, { type: "image/webp" });
  } finally {
    if (source instanceof ImageBitmap) source.close();
  }
}
