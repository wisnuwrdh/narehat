import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import { uploadPhoto, deletePhoto, extractKeyFromUrl } from "@/lib/storage/r2";
import { compressToWebP } from "@/lib/image/compress";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_SIZE_PRE_COMPRESS = 15 * 1024 * 1024;

async function ensureAdmin(userId: string) {
  const supabase = createDBClient();
  const { data: profile } = await supabase.from("users").select("role").eq("id", userId).single();
  return profile?.role === "admin";
}

function validateFile(file: File) {
  if (file.size > MAX_SIZE_PRE_COMPRESS) {
    return { error: "Ukuran file maksimal 15MB" };
  }
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { error: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Tipe file tidak valid." };
  }
  return null;
}

function validateMagic(buffer: Uint8Array): boolean {
  if (buffer.length < 4) return false;
  return (
    (buffer[0] === 0xff && buffer[1] === 0xd8) ||
    (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) ||
    (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46)
  );
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !(await ensureAdmin(session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createDBClient();
  const formData = await request.formData();
  const productId = (formData.get("productId") as string) || "";
  const file = formData.get("file") as File | null;

  if (!productId) {
    return NextResponse.json({ error: "productId wajib diisi" }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const validationError = validateFile(file);
  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }

  const { data: product } = await supabase
    .from("recommendations")
    .select("id, image_url")
    .eq("id", productId)
    .maybeSingle();
  if (!product) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  if (!validateMagic(buffer)) {
    return NextResponse.json({ error: "File bukan gambar yang valid." }, { status: 400 });
  }

  const compressed = await compressToWebP(buffer);
  const filePath = `products/${productId}/image.webp`;

  let publicUrl: string;
  try {
    publicUrl = await uploadPhoto(filePath, compressed, "image/webp");
  } catch (uploadError) {
    console.error("R2 upload failed:", uploadError);
    return NextResponse.json({ error: "Gagal mengupload gambar" }, { status: 500 });
  }

  if (product.image_url && product.image_url !== publicUrl) {
    const oldKey = extractKeyFromUrl(product.image_url);
    if (oldKey) await deletePhoto(product.image_url).catch(() => {});
  }

  const { error: updateError } = await supabase
    .from("recommendations")
    .update({ image_url: publicUrl })
    .eq("id", productId);

  if (updateError) {
    await deletePhoto(publicUrl).catch(() => {});
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ url: publicUrl }, { status: 200 });
}