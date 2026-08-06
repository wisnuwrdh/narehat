import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const { id } = await params;

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = String(body.name).trim().slice(0, 120);
  if (body.brand !== undefined) updates.brand = String(body.brand).trim().slice(0, 80);
  if (body.category !== undefined) updates.category = String(body.category).trim().slice(0, 80);
  if (body.time_of_day !== undefined) updates.time_of_day = String(body.time_of_day).trim().slice(0, 10);
  if (body.active !== undefined) updates.active = Boolean(body.active);
  if (body.notes !== undefined) updates.notes = String(body.notes).trim().slice(0, 500);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Tidak ada data yang diubah" }, { status: 400 });
  }

  const supabase = createDBClient();
  const { data, error } = await supabase
    .from("skincare_products")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Gagal memperbarui produk" }, { status: 500 });
  }
  return NextResponse.json({ product: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const { id } = await params;

  const supabase = createDBClient();
  const { error } = await supabase
    .from("skincare_products")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
