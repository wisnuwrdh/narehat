import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadPhoto, deletePhoto } from "@/lib/storage/r2";
import { compressToWebP } from "@/lib/image/compress";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_SIZE_PRE_COMPRESS = 15 * 1024 * 1024;

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
    (buffer[0] === 0xFF && buffer[1] === 0xD8) ||
    (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) ||
    (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46)
  );
}

function sanitiseName(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.\./g, "_")
    .slice(0, 100);
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("skin_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ photos: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const date = (formData.get("date") as string) || new Date().toISOString().split("T")[0];
  const notes = (formData.get("notes") as string) || "";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const validationError = validateFile(file);
  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  if (!validateMagic(buffer)) {
    return NextResponse.json({ error: "File bukan gambar yang valid." }, { status: 400 });
  }

  const compressed = await compressToWebP(buffer);

  const safeName = sanitiseName(file.name).replace(/\.[^.]+$/, ".webp");
  const filePath = `${user.id}/${Date.now()}-${safeName}`;

  let publicUrl: string;
  try {
    publicUrl = await uploadPhoto(filePath, compressed, "image/webp");
  } catch (uploadError) {
    console.error("R2 upload failed:", uploadError);
    return NextResponse.json({ error: "Gagal mengupload foto" }, { status: 500 });
  }

  const { error: insertError } = await supabase
    .from("skin_photos")
    .insert({
      user_id: user.id,
      url: publicUrl,
      date,
      notes,
    });

  if (insertError) {
    await deletePhoto(publicUrl).catch(() => {});
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Photo uploaded",
    url: publicUrl,
  }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Photo ID required" }, { status: 400 });

  const { data: photo } = await supabase
    .from("skin_photos")
    .select("url")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  await deletePhoto(photo.url).catch(() => {});

  const { error } = await supabase
    .from("skin_photos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Photo deleted" });
}
