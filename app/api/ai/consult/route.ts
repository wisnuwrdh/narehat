import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import { retrieveContext, streamAnswer } from "@/lib/ai/rag";
import { countMonthlyUsage, getPlanBucket, getPlanQuota, getUsageSince, recordUsage } from "@/lib/ai/limits";

const encoder = new TextEncoder();

interface Source {
  title: string;
  source: string;
  similarity: number;
}

function handleSSEEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  raw: string
) {
  const line = raw.trim();
  if (!line.startsWith("data:")) return;
  const payload = line.slice(5).trim();
  if (!payload) return;
  if (payload === "[DONE]") {
    controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
    return;
  }
  try {
    const json = JSON.parse(payload);
    const content = json.choices?.[0]?.delta?.content;
    if (typeof content === "string" && content.length > 0) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
      );
    }
  } catch {
    // lewati event yang tidak valid
  }
}

function createSSEStream(
  upstream: ReadableStream<Uint8Array<ArrayBuffer>>,
  meta: string
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(`event: meta\ndata: ${meta}\n\n`));
      const reader = upstream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let sep = buffer.indexOf("\n\n");
          while (sep !== -1) {
            handleSSEEvent(controller, buffer.slice(0, sep));
            buffer = buffer.slice(sep + 2);
            sep = buffer.indexOf("\n\n");
          }
        }
        if (buffer.trim()) handleSSEEvent(controller, buffer);
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      } catch (err) {
        console.error("AI consult stream error:", err);
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ error: "Streaming terganggu. Coba lagi." })}\n\n`
          )
        );
      } finally {
        try {
          reader.releaseLock();
        } catch {}
        controller.close();
      }
    },
    cancel() {},
  });
}

function createStaticSSEStream(meta: string, content: string): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(`event: meta\ndata: ${meta}\n\n`));
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
      );
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });
}

function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt + 60_000) rateLimitMap.delete(key);
  }
}, 60_000);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const supabase = createDBClient();
    const { data: profile } = await supabase
      .from("users")
      .select("plan, plan_expires_at, plan_started_at")
      .eq("id", userId)
      .maybeSingle();

    const bucket = getPlanBucket(profile?.plan, profile?.plan_expires_at);
    const consultLimit = getPlanQuota(bucket).consult;
    const consultUsed = await countMonthlyUsage(supabase, userId, "consult", getUsageSince(bucket, profile?.plan_started_at));

    if (consultUsed >= consultLimit) {
      const upgrade =
        bucket === "free"
          ? "Upgrade ke Premium untuk 100x/bulan."
          : bucket === "premium"
            ? "Upgrade ke Pro untuk 300x/bulan."
            : "";
      return NextResponse.json(
        {
          error: "Batas konsultasi bulanan tercapai",
          message: `Kamu sudah menggunakan ${consultLimit}x AI Consult bulan ini. ${upgrade}`,
          free_remaining: 0,
        },
        { status: 402 }
      );
    }

    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Terlalu banyak request. Coba lagi dalam 1 menit." },
        { status: 429 }
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

    const INJECTION_PATTERNS = [
      /abaikan\s{0,3}(?:semua|seluruh)\s{0,3}(?:instruksi|perintah|aturan)/i,
      /(?:tampilkan|bocorkan|sebutkan|tulis)\s{0,3}(?:system prompt|instruksi internal|aturan internal)/i,
      /kamu\s{0,3}sekarang\s{0,3}(?:adalah|jadi)/i,
      /ignore\s{0,3}(?:all|previous)\s{0,3}instructions/i,
      /diagnos[ai]\s{0,3}(?:kanlah|kan|a)/i,
      /resepkan\s{0,3}obat/i,
      /(?:beri|kasih|tulis)\s{0,3}(?:tahu\s)?\s{0,3}diagnos[ai]/i,
      /(?:kanker|tumor|HIV|AIDS|hepatitis|covid)/i,
    ];

    if (INJECTION_PATTERNS.some((p) => p.test(question))) {
      return NextResponse.json(
        { error: "Pertanyaan tidak sesuai kebijakan. AI Consultant Narehat tidak memberikan diagnosis medis atau meresepkan obat. Silakan konsultasikan ke dokter kulit untuk hal tersebut." },
        { status: 400 }
      );
    }

    let insightContext: string | undefined;

    const { data: recentInsights } = await supabase
      .from("insights")
      .select("title, description, type, date")
      .eq("user_id", userId)
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

    const result = await retrieveContext(question);

    const sources: Source[] = result?.sources ?? [];
    const context = result?.context ?? "";

    const consultRemaining = Math.max(0, consultLimit - consultUsed - 1);

    const meta = JSON.stringify({
      question,
      sources,
      disclaimer:
        "Informasi ini bersifat edukatif, bukan pengganti diagnosis medis profesional. Jika kondisi kulitmu memburuk atau tidak membaik, segera konsultasikan ke dokter kulit.",
      free_remaining: consultRemaining,
    });

    if (!result) {
      await recordUsage(supabase, userId, "consult");
      return sseResponse(
        createStaticSSEStream(
          meta,
          "Maaf, saat ini aku belum menemukan jurnal yang relevan dengan pertanyaanmu. Coba tanyakan dengan kata kunci yang berbeda atau konsultasikan langsung ke dokter kulit terdekat."
        )
      );
    }

    const sumoPodResponse = await streamAnswer(question, context, insightContext);

    await recordUsage(supabase, userId, "consult");

    return sseResponse(createSSEStream(sumoPodResponse.body!, meta));
  } catch (error) {
    console.error("AI consult error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pertanyaan. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
