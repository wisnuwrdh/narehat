const MAX_DIMENSION = 1200;
const QUALITY = 0.85;

export async function compressImageOnClient(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  let dstW = width;
  let dstH = height;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = MAX_DIMENSION / Math.max(width, height);
    dstW = Math.round(width * ratio);
    dstH = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = dstW;
  canvas.height = dstH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, dstW, dstH);
  bitmap.close();

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
          const name = file.name.replace(/\.[^.]+$/, ".webp");
          resolve(new File([blob], name, { type: "image/webp" }));
        } else {
          resolve(file);
        }
      },
      "image/webp",
      QUALITY
    );
  });
}