import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import { deletePhotos } from "@/lib/storage/r2";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const userEmail = session.user.email || "";

  const supabase = createDBClient();
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ user: { id: userId, email: userEmail } });
  }

  return NextResponse.json({ user: { ...profile, email: userEmail } });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const supabase = createDBClient();
  const body = await request.json();
  const { name, skin_type, acne_severity, goal, theme, onboarding_completed } = body;

  const updates: Record<string, unknown> = {};
  if (name) updates.name = name;
  if (skin_type) updates.skin_type = skin_type;
  if (acne_severity) updates.acne_severity = acne_severity;
  if (goal) updates.goal = goal;
  if (theme) updates.theme = theme;
  if (typeof onboarding_completed === "boolean") updates.onboarding_completed = onboarding_completed;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Profile updated" });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const supabase = createDBClient();

  const errors: string[] = [];

  const { data: photos } = await supabase
    .from("skin_photos")
    .select("url")
    .eq("user_id", userId);

  if (photos && photos.length > 0) {
    const urls = photos.map((p) => p.url).filter(Boolean);
    await deletePhotos(urls).catch((err) =>
      console.error("Failed to delete photos from R2:", err)
    );
  }

  const { error } = await supabase.from("daily_logs").delete().eq("user_id", userId);
  if (error) errors.push(`daily_logs: ${error.message}`);

  const { error: photosError } = await supabase.from("skin_photos").delete().eq("user_id", userId);
  if (photosError) errors.push(`skin_photos: ${photosError.message}`);

  const { error: insightsError } = await supabase.from("insights").delete().eq("user_id", userId);
  if (insightsError) errors.push(`insights: ${insightsError.message}`);

  const { error: productsError } = await supabase.from("skincare_products").delete().eq("user_id", userId);
  if (productsError) errors.push(`skincare_products: ${productsError.message}`);

  const { error: notifError } = await supabase.from("notifications").delete().eq("user_id", userId);
  if (notifError) errors.push(`notifications: ${notifError.message}`);

  const { error: usageError } = await supabase.from("ai_usage").delete().eq("user_id", userId);
  if (usageError) errors.push(`ai_usage: ${usageError.message}`);

  const { error: paymentsError } = await supabase.from("payments").delete().eq("user_id", userId);
  if (paymentsError) errors.push(`payments: ${paymentsError.message}`);

  const { error: userError } = await supabase.from("users").delete().eq("id", userId);
  if (userError) errors.push(`users: ${userError.message}`);

  if (errors.length > 0) {
    console.error("Failed to delete account, errors:", errors.join("; "));
    return NextResponse.json({ error: errors.join("; ") }, { status: 500 });
  }

  return NextResponse.json({ message: "Account deleted" });
}
