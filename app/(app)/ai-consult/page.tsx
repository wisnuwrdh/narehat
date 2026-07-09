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
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const FREE_LIMIT = 3;
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const remaining = FREE_LIMIT - userMessageCount;
  const isPremium = user.plan !== "free";
  const limitReached = !isPremium && userMessageCount >= FREE_LIMIT;

  useEffect(() => {
    localStorage.setItem("narehat-ai-chat", JSON.stringify(messages));
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
          const err = await res.json();
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

        const data = await res.json();

        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          sources: data.sources,
          disclaimer: data.disclaimer,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
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
    [input, loading]
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
    <div className="h-dvh overflow-hidden flex flex-col bg-white">
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
          {!isPremium && !limitReached && (
            <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-200">
              {remaining}/{FREE_LIMIT}
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
                    {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
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

        {loading && (
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
              <p className="text-sm font-bold mb-1">Batas konsultasi gratis tercapai</p>
              <p className="text-xs text-white/80 mb-3">Kamu telah menggunakan {FREE_LIMIT}x konsultasi gratis. Upgrade ke Premium untuk AI Consult unlimited + deteksi jerawat dari foto.</p>
              <Link
                href="/pricing"
                className="inline-block px-4 py-2 bg-white text-primary text-xs font-bold rounded-xl"
              >
                Lihat Harga Upgrade
              </Link>
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
            <span className="text-sm text-muted">Kamu telah menggunakan semua kouta gratis</span>
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
