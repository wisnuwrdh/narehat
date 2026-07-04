"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Send,
  Plus,
  Mic,
  Lightbulb,
  School,
  BookOpen,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  type?: "text" | "list" | "sources";
  items?: { title: string; desc: string }[];
}

const suggestedQuestions = [
  "Apa bedanya jerawat hormonal dan bakteri?",
  "Skincare apa yang cocok untuk jerawat hormonal?",
  "Berapa lama jerawat hormonal biasanya sembuh?",
];

const initialMessages: Message[] = [
  {
    id: "1",
    role: "ai",
    content:
      'Halo Wisnu! 👋 Aku adalah AI Consultant Narehat yang berbasis jurnal dermatologi peer-reviewed. Aku bisa bantu jawab pertanyaan seputar jerawat, skincare, dan kesehatan kulitmu. Tanyakan apa saja!',
    type: "text",
  },
  {
    id: "2",
    role: "user",
    content: "Kenapa jerawatku sering muncul di dagu ya? Apa hubungannya sama hormon?",
  },
  {
    id: "3",
    role: "ai",
    content:
      "Berdasarkan jurnal dermatologi, jerawat di area dagu dan rahang memang sering berkaitan dengan faktor hormonal. Berikut penjelasannya:",
    type: "list",
    items: [
      { title: "Fluktuasi hormon", desc: "Androgen meningkatkan produksi sebum di area dagu" },
      { title: "Stres", desc: "Meningkatkan kortisol yang memicu inflamasi" },
      { title: "Pola tidur", desc: "Tidur kurang dari 7 jam berkorelasi dengan jerawat hormonal" },
    ],
  },
  {
    id: "4",
    role: "ai",
    content:
      "Dari data tracking-mu, aku melihat ada korelasi antara kurang tidur dan munculnya jerawat di dagu. Coba tingkatkan kualitas tidurmu dulu ya! 💤",
    type: "text",
  },
];

export default function AIConsultPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content:
          "Terima kasih atas pertanyaannya! Berdasarkan data jurnal dermatologi dan tracking harianmu, aku akan analisis lebih lanjut. Untuk sementara, pastikan kamu cukup tidur 7-8 jam dan hindari makanan tinggi gula ya!",
        type: "text",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 pt-6 pb-3 flex items-center gap-3 bg-white sticky top-0 z-10 border-b border-border-subtle">
        <Link
          href="/dashboard"
          className="btn-press p-2 -ml-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center relative">
            <Bot className="w-5 h-5 text-primary" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">Narehat AI</h1>
            <p className="text-[10px] text-muted">Online • Berbasis jurnal dermatologi</p>
          </div>
        </div>
        <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-lg">PRO</span>
      </header>

      {/* Chat Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === "ai" ? (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="max-w-[85%] space-y-3">
                  <div className="chat-bubble-ai bg-slate-50 border border-border-subtle p-3.5">
                    <p className="text-sm text-slate-700 leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.type === "list" && msg.items && (
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4">
                      <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
                        <School className="w-3.5 h-3.5" /> Faktor Penyebab:
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {msg.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                            <span>
                              <strong>{item.title}:</strong> {item.desc}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {msg.id === "4" && (
                    <div className="flex items-center gap-2 px-1">
                      <BookOpen className="w-3.5 h-3.5 text-muted-light" />
                      <span className="text-[10px] text-muted-light">Sumber: J. Invest. Dermatol. (2023), AAD Guidelines</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-3 justify-end">
                <div className="chat-bubble-user bg-primary text-white p-3.5 max-w-[85%]">
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="chat-bubble-ai bg-slate-50 border border-border-subtle p-3.5">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* Suggested Questions */}
        {!isTyping && messages.length <= 4 && (
          <div className="pt-2">
            <p className="text-[10px] text-muted font-semibold mb-2 px-1">Pertanyaan yang mungkin kamu punya:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(q)}
                  className="btn-press px-3 py-2 bg-white border border-border-light rounded-xl text-xs text-slate-600 hover:border-primary/30 hover:text-primary transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="px-4 py-3 bg-white border-t border-border-subtle safe-bottom">
        <div className="flex items-end gap-2">
          <button className="btn-press p-2.5 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-slate-50 rounded-2xl border border-border-light flex items-end px-3 py-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Tanyakan sesuatu..."
              className="flex-1 bg-transparent text-sm resize-none outline-none max-h-24 py-1"
              rows={1}
              style={{ minHeight: "24px" }}
            />
            <button className="btn-press p-1.5 text-muted hover:text-primary transition-colors">
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="btn-press p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
