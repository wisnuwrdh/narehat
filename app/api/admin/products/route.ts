import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function ensureAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const user = await ensureAdmin(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const supabase = await createClient();
  const user = await ensureAdmin(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, brand, description, price, rating, reviews, affiliate_link, image_url, category, ingredients, why } = body;

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
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const user = await ensureAdmin(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, ...fields } = body;

  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  for (const key of ["name", "brand", "description", "category", "ingredients", "why", "affiliate_link", "image_url", "is_active"]) {
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
  const supabase = await createClient();
  const user = await ensureAdmin(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  const { error } = await supabase.from("recommendations").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Product deactivated" });
}