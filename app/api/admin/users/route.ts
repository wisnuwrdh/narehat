import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";

const VALID_PLANS = ["free", "premium_monthly", "premium_yearly", "pro_monthly", "pro_yearly"];
const USER_COLUMNS = "id, name, email, plan, plan_expires_at, onboarding_completed, role, created_at, skin_type, acne_severity, goal";

async function ensureAdmin(userId: string) {
  const supabase = createDBClient();
  const { data: profile } = await supabase.from("users").select("role").eq("id", userId).single();
  return profile?.role === "admin";
}

function escapeLike(value: string) {
  return value.replace(/[%_,]/g, (c) => `\\${c}`);
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
    const [userRes, productsRes, paymentsRes] = await Promise.all([
      supabase.from("users").select(USER_COLUMNS).eq("id", id).maybeSingle(),
      supabase
        .from("skincare_products")
        .select("name, brand, category, active, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("order_id, plan, amount, status, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
    ]);

    if (userRes.error) return NextResponse.json({ error: userRes.error.message }, { status: 500 });
    if (!userRes.data) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    return NextResponse.json({
      user: userRes.data,
      products: productsRes.data || [],
      payments: paymentsRes.data || [],
    });
  }

  const search = (searchParams.get("search") || "").trim();
  const plan = (searchParams.get("plan") || "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") || "20", 10) || 20));

  let query = supabase
    .from("users")
    .select(USER_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    const escaped = escapeLike(search);
    query = query.or(`name.ilike.%${escaped}%,email.ilike.%${escaped}%`);
  }
  if (plan) {
    query = query.eq("plan", plan);
  }

  const start = (page - 1) * perPage;
  query = query.range(start, start + perPage - 1);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    users: data || [],
    total: count || 0,
    page,
    per_page: perPage,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !(await ensureAdmin(session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createDBClient();
  const body = await request.json();
  const { id, plan } = body;

  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
  if (!VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: "Plan tidak valid" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("users")
    .select("plan, plan_expires_at")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

  const now = new Date();
  const updates: Record<string, unknown> = { plan, updated_at: now.toISOString() };

  if (plan === "free") {
    updates.plan_expires_at = null;
    updates.plan_started_at = null;
  } else {
    const durationDays = plan.includes("yearly") ? 365 : 30;
    const active =
      existing.plan !== "free" &&
      existing.plan_expires_at &&
      new Date(existing.plan_expires_at).getTime() > now.getTime();
    const base = active ? new Date(existing.plan_expires_at as string) : now;
    updates.plan_expires_at = new Date(base.getTime() + durationDays * 86400000).toISOString();
    updates.plan_started_at = now.toISOString();
  }

  const { error } = await supabase.from("users").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Plan updated" });
}
