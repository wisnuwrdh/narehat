"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@/contexts/UserContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; source: string; similarity: number }[];
  disclaimer?: string;
  timestamp: number;
}

const SAMPLE_QUESTIONS = [
  "Apa bedanya jerawat hormonal dan bakteri?",
  "Skincare apa yang cocok untuk jerawat hormonal?",
  "Berapa lama jerawat hormonal biasanya sembuh?",
];

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Halo! Aku adalah AI Consultant Narehat yang berbasis jurnal dermatologi peer-reviewed. Aku bisa bantu jawab pertanyaan seputar jerawat, skincare, dan kesehatan kulitmu. Tanyakan apa saja!",
  timestamp: Date.now(),
};

export default function AIConsultPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [WELCOME_MESSAGE];
    try {
      const saved = localStorage.getItem("narehat-ai-chat");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return [WELCOME_MESSAGE];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const [freeRemaining, setFreeRemaining] = useState(0);
  const [consultLimit, setConsultLimit] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isPremium = user.plan !== "free";
  const isPro = user.plan.includes("pro");
  const limitReached = consultLimit !== null && freeRemaining <= 0;

  useEffect(() => {
    fetch("/api/ai/quota")
      .then((r) => r.json())
      .then((data) => {
        if (data.consult) {
          setConsultLimit(data.consult.limit);
          setFreeRemaining(data.consult.limit - data.consult.used);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem("narehat-ai-chat", JSON.stringify(messages));
    }, 400);
    return () => clearTimeout(t);
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const question = (text || input).trim();
      if (!question || loading || limitReached) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      try {
        const res = await fetch("/api/ai/consult", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (res.status === 402) {
            setFreeRemaining(0);
          }
          const errMsg: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: err.message || err.error || "Terjadi kesalahan. Coba lagi nanti.",
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, errMsg]);
          setLoading(false);
          return;
        }

        if (!res.body) throw new Error("Empty response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantId: string | null = null;
        let done = false;
        let streamError = "";
        let gotContent = false;

        const appendToAssistant = (delta: string) => {
          if (delta) gotContent = true;
          if (assistantId) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + delta } : m
              )
            );
          }
        };

        while (true) {
          const { done: readerDone, value } = await reader.read();
          if (readerDone) break;
          buffer += decoder.decode(value, { stream: true });

          let sep = buffer.indexOf("\n\n");
          while (sep !== -1) {
            const raw = buffer.slice(0, sep);
            buffer = buffer.slice(sep + 2);

            let eventType = "message";
            let dataLine = "";
            for (const line of raw.split("\n")) {
              if (line.startsWith("event:")) eventType = line.slice(6).trim();
              else if (line.startsWith("data:")) dataLine = line.slice(5).trim();
            }

            if (dataLine === "[DONE]") {
              done = true;
            } else if (dataLine) {
              try {
                const payload = JSON.parse(dataLine);
                if (eventType === "meta") {
                  if (typeof payload.free_remaining === "number") {
                    setFreeRemaining(payload.free_remaining);
                  }
                  const msg: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: "",
                    sources: payload.sources,
                    disclaimer: payload.disclaimer,
                    timestamp: Date.now(),
                  };
                  assistantId = msg.id;
                  setStreamingMsgId(msg.id);
                  setMessages((prev) => [...prev, msg]);
                } else if (eventType === "error") {
                  streamError = payload.error || "Terjadi kesalahan. Coba lagi.";
                  appendToAssistant(streamError);
                } else if (typeof payload.content === "string") {
                  appendToAssistant(payload.content);
                }
              } catch {
                // lewati event yang tidak valid
              }
            }
            sep = buffer.indexOf("\n\n");
          }
        }

        if (!assistantId && (done || streamError || buffer)) {
          const fallbackMsg: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              streamError || "Maaf, jawaban kosong. Coba lagi nanti.",
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, fallbackMsg]);
        } else if (assistantId && done && !gotContent && !streamError) {
          appendToAssistant("Maaf, jawaban kosong. Coba lagi nanti.");
        }
        setStreamingMsgId(null);
      } catch {
        setStreamingMsgId(null);
        const errMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Gagal terhubung ke server. Coba lagi nanti.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, limitReached]
  );

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    localStorage.removeItem("narehat-ai-chat");
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const el = e.target;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    },
    []
  );

  const formatSimilarity = (s: number) => `${Math.round(s * 100)}%`;

  const renderContent = (text: string) => {
    const html = text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br />");
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-white md:max-w-4xl md:mx-auto md:border-x md:border-border-subtle">
      <header className="px-6 pt-6 pb-3 flex items-center gap-3 bg-white sticky top-0 z-10 border-b border-border-subtle">
        <Link
          href="/dashboard"
          className="btn-press p-2 -ml-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center relative">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">Narehat AI</h1>
            <p className="text-[10px] text-muted">Online &bull; Berbasis jurnal dermatologi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {consultLimit !== null && !limitReached && (
            <span className={`px-2 py-1 text-[10px] font-bold rounded-lg border ${
              isPremium
                ? "bg-primary-light text-primary border-primary/20"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {freeRemaining}/{consultLimit}
            </span>
          )}
          <button
            onClick={clearChat}
            className="btn-press p-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">delete_sweep</span>
          </button>
          {isPremium && (
            <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-lg">
              PRO
            </span>
          )}
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isLastAssistant =
            msg.role === "assistant" && idx === messages.length - 1;
          const isStreamingMsg =
            msg.role === "assistant" && msg.id === streamingMsgId && loading;

          return (
            <div key={msg.id}>
              <div
                className={`flex gap-3 ${
                  isUser ? "justify-end" : ""
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-primary text-sm">
                      smart_toy
                    </span>
                  </div>
                )}
                <div
                  className={`p-3.5 max-w-[85%] ${
                    isUser
                      ? "bg-primary text-white"
                      : "bg-slate-50 border border-border-subtle"
                  }`}
                  style={
                    isUser
                      ? { borderRadius: "1.25rem 1.25rem 0.25rem 1.25rem" }
                      : { borderRadius: "1.25rem 1.25rem 1.25rem 0.25rem" }
                  }
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.role === "assistant" ? (
                      <>
                        {renderContent(msg.content)}
                        {isStreamingMsg && (
                          <span className="inline-block w-1 h-4 bg-primary/70 ml-0.5 animate-pulse" />
                        )}
                      </>
                    ) : (
                      msg.content
                    )}
                  </p>
                </div>
                {isUser && (
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-slate-400 text-sm">
                      person
                    </span>
                  </div>
                )}
              </div>

              {!isUser && msg.sources && msg.sources.length > 0 && (
                <div className="ml-11 mt-2 flex items-center gap-2 px-1">
                  <span className="material-symbols-outlined text-[14px] text-muted-light">
                    menu_book
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {msg.sources.map((s, i) => (
                      <span
                        key={i}
                        className="text-[9px] text-muted bg-slate-50 border border-border-light px-1.5 py-0.5 rounded-md"
                      >
                        {s.title.slice(0, 40)}
                        {s.title.length > 40 ? "..." : ""} &bull;{" "}
                        {formatSimilarity(s.similarity)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!isUser && msg.disclaimer && (
                <p className="ml-11 mt-2 text-[9px] text-muted-light italic px-1 leading-relaxed">
                  {msg.disclaimer}
                </p>
              )}
            </div>
          );
        })}

        {loading && streamingMsgId === null && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0 mt-1">
              <span className="material-symbols-outlined text-primary text-sm">
                smart_toy
              </span>
            </div>
            <div
              className="bg-slate-50 border border-border-subtle p-4 flex items-center gap-2"
              style={{ borderRadius: "1.25rem 1.25rem 1.25rem 0.25rem" }}
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          </div>
        )}

        {messages.length <= 1 && !loading && (
          <div className="pt-2">
            <p className="text-[10px] text-muted font-semibold mb-2 px-1">
              Pertanyaan yang mungkin kamu punya:
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="btn-press px-3 py-2 bg-white border border-border-light rounded-xl text-xs text-slate-600 hover:border-primary/30 hover:text-primary transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {limitReached && (
          <div className="pt-2">
            <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-4 text-white">
              <p className="text-sm font-bold mb-1">Batas konsultasi bulanan tercapai</p>
              <p className="text-xs text-white/80 mb-3">
                {isPro
                  ? `Kamu sudah menggunakan ${consultLimit}x AI Consult bulan ini. Kuota direset tiap periode langganan.`
                  : isPremium
                    ? `Kamu sudah menggunakan ${consultLimit}x AI Consult bulan ini. Upgrade ke Pro untuk 300x/bulan + AI Deteksi 100x/bulan.`
                    : `Kamu sudah menggunakan ${consultLimit}x AI Consult bulan ini. Upgrade ke Premium untuk 100x/bulan + AI Deteksi 30x/bulan.`}
              </p>
              {!isPro && (
                <Link
                  href="/pricing"
                  className="inline-block px-4 py-2 bg-white text-primary text-xs font-bold rounded-xl"
                >
                  Lihat Harga Upgrade
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        className="px-4 py-3 bg-white border-t border-border-subtle shrink-0"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {limitReached ? (
          <div className="flex items-center justify-center py-2">
            <span className="text-sm text-muted">Kamu telah menggunakan semua kuota bulan ini</span>
          </div>
        ) : (
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-slate-50 rounded-2xl border border-border-light flex items-end px-3 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan sesuatu..."
              className="flex-1 bg-transparent text-sm resize-none outline-none max-h-[120px] py-1.5 leading-relaxed"
              rows={1}
              disabled={loading}
            />
            <button
              onClick={() => setInput("")}
              className={`btn-press p-1.5 text-muted hover:text-slate-600 transition-colors ${
                input ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={`btn-press p-3 rounded-2xl shadow-lg transition-colors ${
              input.trim() && !loading
                ? "bg-primary text-white shadow-primary/20 hover:bg-primary/90"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
