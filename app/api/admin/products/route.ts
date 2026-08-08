import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import { deletePhoto } from "@/lib/storage/r2";

async function ensureAdmin(userId: string) {
  const supabase = createDBClient();
  const { data: profile } = await supabase.from("users").select("role").eq("id", userId).single();
  if (profile?.role !== "admin") return false;
  return true;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !(await ensureAdmin(session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createDBClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const { data, error } = await supabase.from("recommendations").select("*").eq("id", id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ product: data });
  }

  const category = searchParams.get("category");
  let query = supabase.from("recommendations").select("*").order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data || [] });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !(await ensureAdmin(session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createDBClient();
  const body = await request.json();
  const { name, brand, description, price, rating, reviews, affiliate_link, image_url, category, ingredients, why, skin_types, concerns, shopee_link, tokopedia_link } = body;

  if (!name || !brand || !category) {
    return NextResponse.json({ error: "name, brand, category wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabase.from("recommendations").insert({
    name,
    brand,
    description: description || "",
    price: price || 0,
    rating: rating || 0,
    reviews: reviews || 0,
    affiliate_link: affiliate_link || "",
    image_url: image_url || "",
    category,
    ingredients: ingredients || "",
    why: why || "",
    skin_types: Array.isArray(skin_types) ? skin_types : [],
    concerns: Array.isArray(concerns) ? concerns : [],
    shopee_link: shopee_link || "",
    tokopedia_link: tokopedia_link || "",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !(await ensureAdmin(session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createDBClient();
  const body = await request.json();
  const { id, ...fields } = body;

  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  for (const key of ["name", "brand", "description", "category", "ingredients", "why", "affiliate_link", "image_url", "is_active", "skin_types", "concerns", "derma_insight", "derma_sources", "shopee_link", "tokopedia_link"]) {
    if (fields[key] !== undefined) updates[key] = fields[key];
  }
  if (fields.price !== undefined) updates.price = Number(fields.price);
  if (fields.rating !== undefined) updates.rating = Number(fields.rating);
  if (fields.reviews !== undefined) updates.reviews = Number(fields.reviews);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase.from("recommendations").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Product updated" });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !(await ensureAdmin(session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createDBClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  const permanent = searchParams.get("permanent") === "true";

  if (permanent) {
    const { data: product } = await supabase
      .from("recommendations")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();
    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });

    const { error } = await supabase.from("recommendations").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (product.image_url) await deletePhoto(product.image_url).catch(() => {});
    return NextResponse.json({ message: "Product deleted permanently" });
  }

  const { error } = await supabase.from("recommendations").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Product deactivated" });
}