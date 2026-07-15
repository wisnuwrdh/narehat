"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

function logError(context: string, err: unknown) {
  try {
    console.log("[DEBUG]", context, JSON.stringify(err));
  } catch {
    console.log("[DEBUG]", context, String(err));
  }
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/reset-password`,
      });
      setLoading(false);

      if (authError) {
        logError("resetPassword authError", authError);
        setError(authError.message || "Gagal mengirim email reset. Coba lagi nanti.");
        return;
      }

      setSuccess("Link reset password telah dikirim ke email kamu. Cek inbox atau folder spam.");
      setEmail("");
    } catch (err) {
      logError("resetPassword exception", err);
      setLoading(false);
      setError("Gagal terhubung ke server. Periksa konfigurasi Supabase.");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full min-h-screen">
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center justify-center mb-2">
          <Logo size={48} showText={false} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Lupa Password</h1>
        <p className="text-sm text-muted mt-2">Masukkan email kamu, kami akan kirim link reset password</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 animate-scale-in">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600 animate-scale-in">
          {success}
        </div>
      )}

      <form className="space-y-4 animate-fade-in-up delay-100" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!success}
            className="w-full px-4 py-3.5 bg-slate-50 border border-border-light rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !!success}
          className="btn-press w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Mengirim..." : "Kirim Link Reset"}
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-8 animate-fade-in-up delay-200">
        <Link href="/login" className="text-primary font-bold">Kembali ke login</Link>
      </p>
    </div>
  );
}
