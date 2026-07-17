"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

function logError(context: string, err: unknown) {
  try {
    console.log("[DEBUG]", context, JSON.stringify(err));
  } catch {
    console.log("[DEBUG]", context, String(err));
  }
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError("Link reset tidak valid atau sudah kadaluarsa. Silakan minta link baru.");
      } else {
        setHasSession(true);
      }
      setCheckingSession(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      setLoading(false);

      if (updateError) {
        logError("updateUser authError", updateError);
        setError(updateError.message || "Gagal mengupdate password. Coba lagi nanti.");
        return;
      }

      setSuccess("Password berhasil diubah. Mengarahkan ke login...");
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (err) {
      logError("updateUser exception", err);
      setLoading(false);
      setError("Gagal terhubung ke server. Periksa konfigurasi Supabase.");
    }
  };

  if (checkingSession) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 max-w-md lg:max-w-lg mx-auto w-full min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md lg:max-w-lg mx-auto w-full min-h-screen">
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center justify-center mb-2">
          <Logo size={48} showText={false} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Buat Password Baru</h1>
        <p className="text-sm text-muted mt-2">Masukkan password baru untuk akun kamu</p>
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

      {hasSession && (
        <form className="space-y-4 animate-fade-in-up delay-100" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Baru</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-border-light rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
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
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
            <input
              type="password"
              placeholder="Min. 8 karakter"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-border-light rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !!success}
            className="btn-press w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </form>
      )}

      {!hasSession && !checkingSession && !success && (
        <div className="text-center animate-fade-in-up delay-100">
          <a href="/forgot-password" className="text-primary font-bold text-sm">Minta link reset baru</a>
        </div>
      )}
    </div>
  );
}
