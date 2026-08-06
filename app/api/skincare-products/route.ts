import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const supabase = createDBClient();
  const { data, error } = await supabase
    .from("skincare_products")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Gagal memuat produk" }, { status: 500 });
  }
  return NextResponse.json({ products: data || [] });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await request.json();
  const name = String(body.name || "").trim().slice(0, 120);
  if (!name) return NextResponse.json({ error: "Nama produk wajib diisi" }, { status: 400 });

  const supabase = createDBClient();

  const { data: existing } = await supabase
    .from("skincare_products")
    .select("id")
    .eq("user_id", userId)
    .ilike("name", name);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Produk sudah ada di daftar" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("skincare_products")
    .insert({
      user_id: userId,
      name,
      brand: String(body.brand || "").trim().slice(0, 80),
      category: String(body.category || "").trim().slice(0, 80),
      time_of_day: String(body.time_of_day || "").trim().slice(0, 10),
      notes: String(body.notes || "").trim().slice(0, 500),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Gagal menambahkan produk" }, { status: 500 });
  }
  return NextResponse.json({ product: data });
}
