"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (!msg || msg === "{}") return "Gagal terhubung ke server. Periksa konfigurasi Supabase.";
    if (msg.includes("already registered") || msg.includes("already exists")) return "Email ini sudah terdaftar.";
    if (msg.includes("password")) return "Password minimal 6 karakter.";
    if (msg.includes("valid email")) return "Format email tidak valid.";
    return msg;
  }
  return "Terjadi kesalahan. Coba lagi nanti.";
}

function logError(context: string, err: unknown) {
  try {
    console.log("[DEBUG]", context, JSON.stringify(err));
  } catch {
    console.log("[DEBUG]", context, String(err));
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", agreed: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (!form.agreed) {
      setError("Kamu harus menyetujui Syarat & Ketentuan.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.name } },
      });
      setLoading(false);

      if (authError) {
        logError("signUp authError", authError);
        setError(getErrorMessage(authError));
        return;
      }

      if (data.session) {
        router.push("/onboarding");
      } else {
        setError("");
        setForm({ name: "", email: "", password: "", agreed: false });
        setSuccess("Cek email kamu untuk verifikasi, lalu login kembali.");
      }
    } catch (err) {
      logError("signUp exception", err);
      setLoading(false);
      setError("Gagal terhubung ke server. Periksa konfigurasi Supabase.");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full min-h-screen">
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="inline-flex items-center justify-center mb-2">
          <Logo size={48} showText={false} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Buat akun baru</h1>
        <p className="text-sm text-muted mt-2">Mulai lacak perjalanan kulitmu hari ini</p>
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
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Wisnu Prasetyo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={!!success}
            className="w-full px-4 py-3.5 bg-slate-50 border border-border-light rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            placeholder="nama@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={!!success}
            className="w-full px-4 py-3.5 bg-slate-50 border border-border-light rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 karakter"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={!!success}
              className="w-full px-4 py-3.5 bg-slate-50 border border-border-light rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-light"
            >
              <span className="material-symbols-outlined text-lg">
                {showPassword ? "visibility" : "visibility_off"}
              </span>
            </button>
          </div>
        </div>
        <label className="flex items-start gap-2.5 cursor-pointer animate-fade-in-up delay-200">
          <input
            type="checkbox"
            checked={form.agreed}
            onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
            disabled={!!success}
            className="mt-0.5 w-4 h-4 rounded-lg border-border-light text-primary focus:ring-primary"
          />
          <span className="text-xs text-slate-500 leading-relaxed">
            Saya setuju dengan <a href="#" className="text-primary font-semibold">Syarat &amp; Ketentuan</a> dan <a href="#" className="text-primary font-semibold">Kebijakan Privasi</a> Narehat
          </span>
        </label>
        <button
          type="submit"
          disabled={loading || !!success}
          className="btn-press w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 animate-fade-in-up delay-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6 animate-fade-in-up delay-300">
        <div className="flex-1 h-px bg-border-subtle" />
        <span className="text-xs text-muted-light font-medium">atau daftar dengan</span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      <button
        disabled
        className="btn-press w-full py-3.5 bg-white border border-border-light rounded-2xl font-semibold text-sm text-slate-400 flex items-center justify-center gap-3 transition-colors animate-fade-in-up delay-300 cursor-not-allowed"
      >
        <svg className="w-5 h-5 opacity-40" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google (segera hadir)
      </button>

      <p className="text-center text-sm text-muted mt-8 animate-fade-in-up delay-400">
        Sudah punya akun? <Link href="/login" className="text-primary font-bold">Masuk di sini</Link>
      </p>
    </div>
  );
}
