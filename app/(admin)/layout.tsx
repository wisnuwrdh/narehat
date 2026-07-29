import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const supabase = createDBClient();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return <>{children}</>;
}