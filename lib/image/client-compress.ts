const MAX_DIMENSION = 1200;
const QUALITY = 0.85;

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

function imageFromDataURL(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Format gambar tidak didukung"));
    img.src = dataUrl;
  });
}

async function decodeImage(file: File): Promise<{
  source: HTMLImageElement | ImageBitmap;
  width: number;
  height: number;
}> {
  try {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height };
  } catch {
    const dataUrl = await readAsDataURL(file);
    const img = await imageFromDataURL(dataUrl);
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
