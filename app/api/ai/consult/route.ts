import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consult } from "@/lib/ai/rag";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profile || profile.plan === "free") {
      return NextResponse.json(
        {
          error: "Premium required",
          message:
            "AI Consultant adalah fitur premium. Upgrade plan kamu untuk mengakses konsultasi AI berbasis jurnal dermatologi.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const question = String(body.question || "").trim().slice(0, 500);

    if (!question) {
      return NextResponse.json(
        { error: "Pertanyaan tidak boleh kosong" },
        { status: 400 }
      );
    }

    let insightContext: string | undefined;

    const { data: recentInsights } = await supabase
      .from("insights")
      .select("title, description, type, date")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(3);

    if (recentInsights && recentInsights.length > 0) {
      insightContext = recentInsights
        .map(
          (i) =>
            `[${i.type}] ${i.title} (${i.date}): ${i.description}`
        )
        .join("\n");
    }

    const result = await consult(question, insightContext);

    return NextResponse.json({
      question,
      answer: result.answer,
      sources: result.sources,
      disclaimer: result.disclaimer,
    });
  } catch (error) {
    console.error("AI consult error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pertanyaan. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
