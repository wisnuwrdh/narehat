"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setResetLink("");

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      const { data: found, error: findError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.trim())
        .maybeSingle();

      setLoading(false);

      if (findError || !found) {
        setError("Email tidak ditemukan.");
        return;
      }

      const token = crypto.randomUUID();
      const expiry = new Date(Date.now() + 3600000).toISOString();

      await supabase
        .from("users")
        .update({ reset_token: token, reset_token_expiry: expiry })
        .eq("email", email.trim());

      const link = `${window.location.origin}/reset-password?token=${token}`;
      setResetLink(link);
      setSuccess("Link reset password telah dibuat. Karena email service belum aktif, gunakan link di bawah ini:");
      setEmail("");
    } catch {
      setLoading(false);
      setError("Gagal terhubung ke server.");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md lg:max-w-lg mx-auto w-full min-h-screen">
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center justify-center mb-2">
          <Logo size={48} showText={false} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Lupa Password</h1>
        <p className="text-sm text-muted mt-2">Masukkan email kamu untuk reset password</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 animate-scale-in">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 space-y-3 animate-scale-in">
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
            {success}
          </div>
          {resetLink && (
            <div className="p-3 bg-slate-50 border border-border-light rounded-xl text-xs break-all">
              <a href={resetLink} className="text-primary font-semibold">{resetLink}</a>
            </div>
          )}
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
          {loading ? "Mengecek..." : "Kirim Link Reset"}
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-8 animate-fade-in-up delay-200">
        <Link href="/login" className="text-primary font-bold">Kembali ke login</Link>
      </p>
    </div>
  );
}
