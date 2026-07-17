import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deletePhotos } from "@/lib/storage/r2";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ user: { id: user.id, email: user.email } });
  }

  return NextResponse.json({ user: { ...profile, email: user.email } });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, skin_type, acne_severity, goal, theme } = body;

  const updates: Record<string, unknown> = {};
  if (name) updates.name = name;
  if (skin_type) updates.skin_type = skin_type;
  if (acne_severity) updates.acne_severity = acne_severity;
  if (goal) updates.goal = goal;
  if (theme) updates.theme = theme;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Profile updated" });
}

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: photos } = await supabase
    .from("skin_photos")
    .select("url")
    .eq("user_id", user.id);

  if (photos && photos.length > 0) {
    const urls = photos.map((p) => p.url).filter(Boolean);
    await deletePhotos(urls).catch((err) =>
      console.error("Failed to delete photos from R2:", err)
    );
  }

  const { error } = await supabase.from("daily_logs").delete().eq("user_id", user.id);
  if (error) console.error("Failed to delete logs:", error.message);

  const { error: photosError } = await supabase.from("skin_photos").delete().eq("user_id", user.id);
  if (photosError) console.error("Failed to delete photo records:", photosError.message);

  const { error: insightsError } = await supabase.from("insights").delete().eq("user_id", user.id);
  if (insightsError) console.error("Failed to delete insights:", insightsError.message);

  const { error: productsError } = await supabase.from("skincare_products").delete().eq("user_id", user.id);
  if (productsError) console.error("Failed to delete products:", productsError.message);

  const { error: notifError } = await supabase.from("notifications").delete().eq("user_id", user.id);
  if (notifError) console.error("Failed to delete notifications:", notifError.message);

  const { error: usageError } = await supabase.from("ai_usage").delete().eq("user_id", user.id);
  if (usageError) console.error("Failed to delete ai usage:", usageError.message);

  const { error: userError } = await supabase.from("users").delete().eq("id", user.id);
  if (userError) console.error("Failed to delete user profile:", userError.message);

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const adminClient = (await import("@supabase/supabase-js")).createClient(supabaseUrl, serviceKey);
    const { error: authError } = await adminClient.auth.admin.deleteUser(user.id);
    if (authError) console.error("Failed to delete auth user:", authError.message);
  }

  return NextResponse.json({ message: "Account deleted" });
}
