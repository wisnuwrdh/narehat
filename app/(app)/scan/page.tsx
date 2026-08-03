"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { compressImageOnClient, compressThumbOnClient } from "@/lib/image/client-compress";
import { thumbUrlFor } from "@/lib/storage/thumb-url";
import { ProductAutocomplete } from "@/components/ui/ProductAutocomplete";
import { useUser } from "@/contexts/UserContext";

interface SkinPhoto {
  id: string;
  url: string;
  date: string;
  ai_analysis: {
    types?: string[];
    severity?: string;
    confidence?: number;
    location?: string;
    triggers?: string[];
    analyzed_at?: string;
    type?: string;
    description?: string;
    recommendations?: string[];
    product_name?: string;
  } | null;
  analysis_type: string | null;
}

const userFriendlyError = (e: unknown): string => {
  const msg = e instanceof Error ? e.message : "";
  const name = e instanceof DOMException ? e.name : "";
  const map: Record<string, string> = {
    "The source image could not be decoded": "File tidak bisa dibaca sebagai gambar. Coba simpan ulang sebagai JPG atau PNG biasa.",
    "Image compression failed": "Gagal mengompres gambar. Coba foto lain.",
    "Gagal membaca file": "File terlalu besar atau tidak bisa dibaca. Coba foto dengan resolusi lebih rendah.",
    "Format gambar tidak didukung": "File tidak bisa diproses browser. Coba simpan ulang sebagai JPG.",
    "Canvas tidak didukung": "Browser tidak mendukung kompresi gambar. Coba browser lain (Chrome).",
    "Gagal memproses gambar": "Gagal memproses gambar. Coba foto lain.",
    "HEIC": "Format HEIC tidak didukung. Gunakan JPG atau PNG.",
    "AVIF": "Format AVIF tidak didukung. Gunakan JPG atau PNG.",
    "Format gambar tidak dikenal": "File berekstensi .png tapi bukan format gambar yang dikenal browser. Coba simpan ulang sebagai JPG.",
    "PNG resolusi terlalu tinggi": "Resolusi PNG terlalu tinggi untuk diproses di HP ini. Gunakan foto JPG dengan resolusi lebih rendah.",
  };
  if (name === "NotFoundError" || name === "NotReadableError") {
    return "File gagal dibaca karena sudah tidak tersedia di memori HP. Pilih ulang fotonya.";
  }
  return map[msg] || msg || "Gagal terhubung ke server.";
};

async function snapshotFile(file: File): Promise<File> {
  const buf = await file.arrayBuffer();
  return new File([buf], file.name, { type: file.type });
}

export default function ScanPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const purgingRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [detecting, setDetecting] = useState(false);
  const [detectResult, setDetectResult] = useState<{
    typesDisplay: string[];
    severityDisplay: string;
    confidence: number;
    location: string;
    triggers: string[];
    tips: string[];
    trend: string | null;
    disclaimer: string;
    is_clean_skin?: boolean;
  } | null>(null);
  const [detectError, setDetectError] = useState("");

  const [purgingProduct, setPurgingProduct] = useState("");
  const [purgingPhoto, setPurgingPhoto] = useState<string | null>(null);
  const [purgingFile, setPurgingFile] = useState<File | null>(null);
  const [purgingResult, setPurgingResult] = useState<{
    type: string;
    typeDisplay: string;
    confidence: number;
    description: string;
    recommendations: string[];
    disclaimer: string;
  } | null>(null);
  const [purgingLoading, setPurgingLoading] = useState(false);
  const [purgingError, setPurgingError] = useState("");

  const [history, setHistory] = useState<SkinPhoto[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [quota, setQuota] = useState<{
    detect: { used: number; limit: number };
    purging: { used: number; limit: number };
  } | null>(null);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => setHistory(data.photos || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));

    fetch("/api/ai/quota")
      .then((r) => r.json())
      .then((data) => setQuota(data))
      .catch(() => {});
  }, []);

  const detectRemaining = quota ? Math.max(0, quota.detect.limit - quota.detect.used) : null;
  const purgingRemaining = quota ? Math.max(0, quota.purging.limit - quota.purging.used) : null;
  const detectQuotaHint =
    user.plan === "free"
      ? "Upgrade ke Premium untuk 30x/bulan."
      : user.plan.includes("pro")
        ? "Kuota direset tiap periode langganan."
        : "Upgrade ke Pro untuk 100x/bulan.";

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDetectResult(null);
    setDetectError("");
    setPurgingResult(null);
    setPurgingError("");
    try {
      const snap = await snapshotFile(file);
      setPhotoFile(snap);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.onerror = () => setDetectError("Gagal membaca file. Coba foto lain.");
      reader.readAsDataURL(snap);
    } catch {
      setPhotoFile(null);
      setPhotoPreview(null);
      setDetectError("Gagal membaca file. Coba pilih ulang fotonya.");
    } finally {
      e.target.value = "";
    }
  };

  const handleDetect = async () => {
    if (!photoFile || detecting) return;
    setDetecting(true);
    setDetectError("");
    setDetectResult(null);
    try {
      const compressed = await compressImageOnClient(photoFile);
      const thumb = await compressThumbOnClient(photoFile);
      const fd = new FormData();
      fd.append("file", compressed);
      fd.append("thumb", thumb);
      const res = await fetch("/api/ai/detect", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setDetectError(data.error || "Gagal analisis. Coba lagi.");
        return;
      }
      setDetectResult(data);
      if (typeof data.detect_remaining === "number" && typeof data.detect_limit === "number") {
        setQuota((prev) => ({
          detect: { used: data.detect_limit - data.detect_remaining, limit: data.detect_limit },
          purging: prev?.purging ?? { used: 0, limit: 0 },
        }));
      }
      // Refresh history after new scan
      fetch("/api/photos")
        .then((r) => r.json())
        .then((d) => setHistory(d.photos || []))
        .catch(() => {});
    } catch (e) {
      setDetectError(userFriendlyError(e));
    } finally {
      setDetecting(false);
    }
  };

  const handlePurgingPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPurgingError("");
    try {
      const snap = await snapshotFile(file);
      setPurgingFile(snap);
      const reader = new FileReader();
      reader.onload = () => setPurgingPhoto(reader.result as string);
      reader.onerror = () => setPurgingError("Gagal membaca file. Coba foto lain.");
      reader.readAsDataURL(snap);
    } catch {
      setPurgingFile(null);
      setPurgingPhoto(null);
      setPurgingError("Gagal membaca file. Coba pilih ulang fotonya.");
    } finally {
      e.target.value = "";
    }
  };

  const handlePurgingCheck = async () => {
    if (!purgingFile || !purgingProduct.trim() || purgingLoading) return;
    setPurgingLoading(true);
    setPurgingError("");
    setPurgingResult(null);
    try {
      const compressed = await compressImageOnClient(purgingFile);
      const thumb = await compressThumbOnClient(purgingFile);
      const fd = new FormData();
      fd.append("file", compressed);
      fd.append("thumb", thumb);
      fd.append("product_name", purgingProduct.trim());
      const res = await fetch("/api/ai/purging", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setPurgingError(data.error || "Gagal cek purging. Coba lagi.");
        return;
      }
      setPurgingResult(data);
    } catch (e) {
      setPurgingError(userFriendlyError(e));
    } finally {
      setPurgingLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus scan ini?")) return;
    try {
      const res = await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setHistory((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };

  const scansWithAnalysis = history.filter((p) => p.ai_analysis);
  const latestScan = scansWithAnalysis[0];

  return (
    <main className="max-w-md md:max-w-4xl mx-auto">
      <header className="px-6 pt-6 pb-4 flex items-center gap-3 sticky top-0 bg-white z-10">
        <Link
          href="/dashboard"
          className="btn-press w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-600 text-lg">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Scan Kulit</h1>
          <p className="text-sm text-muted">Analisis jerawat dengan AI</p>
        </div>
      </header>

      {/* Upload Section */}
      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-rose-500">photo_camera</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">Upload Foto</h3>
              <p className="text-xs text-muted">Front face, good lighting, no filter</p>
              <p className="text-[10px] text-muted-light mt-1">⚠ Foto area berjerawat agar analisis akurat</p>
            </div>
            {detectRemaining !== null && (
              <span className={`px-2 py-1 text-[10px] font-bold rounded-lg border whitespace-nowrap ${
                detectRemaining > 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}>
                {detectRemaining > 0 ? `Sisa ${detectRemaining}x/bln` : "Kuota habis"}
              </span>
            )}
            {photoPreview && (
              <button onClick={() => { setPhotoPreview(null); setPhotoFile(null); setDetectResult(null); setDetectError(""); }} className="btn-press p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} className="hidden" />
          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden mb-4">
              <img src={photoPreview} alt="Preview" className="w-full h-56 object-cover rounded-2xl" />
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} className="btn-press w-full py-10 border-2 border-dashed border-border-light rounded-2xl flex flex-col items-center gap-2 hover:border-primary/30 hover:bg-primary-light/10 transition-all mb-4">
              <span className="material-symbols-outlined text-3xl text-muted-light">add_a_photo</span>
              <span className="text-sm font-semibold text-slate-600">Tap untuk upload foto</span>
              <span className="text-xs text-muted">Atau ambil foto sekarang</span>
            </button>
          )}
          {photoPreview && !detectResult && (
            <button
              onClick={handleDetect}
              disabled={detecting || detectRemaining === 0}
              className="btn-press w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              {detecting ? "Menganalisis..." : "Analisis Sekarang"}
            </button>
          )}
          {detectRemaining === 0 && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex items-center gap-2 mt-3">
              <span className="material-symbols-outlined text-sm">star</span>
              <span>Kuota AI Deteksi bulan ini habis. {detectQuotaHint}</span>
            </div>
          )}
          {detecting && (
            <div className="flex items-center justify-center gap-3 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
              </div>
              <span className="text-sm text-muted">AI sedang menganalisis foto...</span>
            </div>
          )}
          {detectError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {detectError}
            </div>
          )}
        </div>
      </section>

      {/* Detect Results */}
      {detectResult && (
        <section className="px-6 mb-6">
          <div className="bg-white border border-primary/20 rounded-3xl p-5 shadow-sm animate-scale-in">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <h3 className="font-bold text-slate-800">Hasil Deteksi</h3>
              <span className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                detectResult.confidence >= 0.7
                  ? "bg-emerald-50 text-emerald-700"
                  : detectResult.confidence >= 0.4
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700"
              }`}>
                <span className="material-symbols-outlined text-[12px]">psychology</span>
                {Math.round(detectResult.confidence * 100)}% yakin
              </span>
              {detectResult.trend && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  detectResult.trend === "membaik" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}>
                  <span className="material-symbols-outlined text-[12px]">
                    {detectResult.trend === "membaik" ? "trending_down" : "trending_up"}
                  </span>
                  {detectResult.trend === "membaik" ? "Membaik" : "Memburuk"}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <span className="text-[10px] text-muted block mb-1">Jenis</span>
                <span className="text-xs font-bold text-slate-800">{detectResult.typesDisplay.join(", ") || "-"}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <span className="text-[10px] text-muted block mb-1">Severity</span>
                <span className="text-xs font-bold text-slate-800">{detectResult.severityDisplay}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <span className="text-[10px] text-muted block mb-1">Lokasi</span>
                <span className="text-xs font-bold text-slate-800">{detectResult.location || "-"}</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl">
                <span className="text-[10px] text-muted block mb-1">Pemicu</span>
                <span className="text-xs font-bold text-slate-800">{detectResult.triggers.join(", ") || "-"}</span>
              </div>
            </div>
            {detectResult.tips.length > 0 && (
              <div className="p-3 bg-sky-50 rounded-xl mb-3">
                <span className="text-[10px] font-bold text-sky-700 block mb-2">
                  <span className="material-symbols-outlined text-[12px] align-text-bottom">lightbulb</span> Tips
                </span>
                {detectResult.tips.map((tip, i) => (
                  <p key={i} className="text-[11px] text-slate-700 flex items-start gap-1 mb-1 last:mb-0">
                    <span className="text-sky-500 font-bold shrink-0">•</span> {tip}
                  </p>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted italic mb-3">{detectResult.disclaimer}</p>
            <div className="flex gap-2">
              <button onClick={handleDetect} disabled={detecting} className="btn-press flex-1 py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-colors">
                Scan Ulang
              </button>
              <Link
                href="/ai-consult"
                className="btn-press flex-1 py-2 bg-white border border-border-light text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">chat</span>
                Tanya AI Consultant
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Purging Checker */}
      <section className="px-6 mb-6">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-500">science</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">Purging Checker</h3>
              <p className="text-xs text-muted">Ini purging atau breakout?</p>
              <p className="text-[10px] text-muted-light mt-1">⚠ Foto area berjerawat agar analisis akurat</p>
            </div>
            {purgingRemaining !== null && (
              <span className={`px-2 py-1 text-[10px] font-bold rounded-lg border whitespace-nowrap ${
                purgingRemaining > 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}>
                {purgingRemaining > 0 ? `Sisa ${purgingRemaining}x/bln` : "Kuota habis"}
              </span>
            )}
          </div>
          <div className="mb-3">
            <ProductAutocomplete
              label=""
              placeholder="Nama produk baru yang dipakai..."
              value={purgingProduct}
              onChange={(val) => setPurgingProduct(val)}
            />
          </div>
          <input ref={purgingRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePurgingPhoto} className="hidden" />
          {purgingPhoto ? (
            <div className="relative rounded-xl overflow-hidden mb-3">
              <img src={purgingPhoto} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
              <button onClick={() => { setPurgingPhoto(null); setPurgingFile(null); }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg text-xs">Hapus</button>
            </div>
          ) : (
            <button onClick={() => purgingRef.current?.click()} className="btn-press w-full py-6 border-2 border-dashed border-border-light rounded-xl flex flex-col items-center gap-1 hover:border-primary/30 hover:bg-primary-light/10 transition-all mb-3">
              <span className="material-symbols-outlined text-2xl text-muted-light">add_a_photo</span>
              <span className="text-xs text-muted">Upload foto kondisi kulit saat ini</span>
            </button>
          )}
          {!purgingResult && !purgingLoading && (
            <button
              onClick={handlePurgingCheck}
              disabled={!purgingPhoto || !purgingProduct.trim() || purgingRemaining === 0}
              className={`btn-press w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                purgingPhoto && purgingProduct.trim() && purgingRemaining !== 0
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              Cek Purging vs Breakout
            </button>
          )}
          {purgingRemaining === 0 && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex items-center gap-2 mt-3">
              <span className="material-symbols-outlined text-sm">star</span>
              <span>Kuota Purging Checker bulan ini habis. {detectQuotaHint}</span>
            </div>
          )}
          {purgingLoading && (
            <div className="flex items-center justify-center gap-3 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
              </div>
              <span className="text-sm text-muted">Menganalisis...</span>
            </div>
          )}
          {purgingError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {purgingError}
            </div>
          )}
          {purgingResult && (
            <div className="space-y-3">
              <div className={`p-4 rounded-2xl border-2 ${purgingResult.type === "purging" ? "bg-emerald-50 border-emerald-200" : purgingResult.type === "normal" ? "bg-sky-50 border-sky-200" : "bg-red-50 border-red-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`material-symbols-outlined ${purgingResult.type === "purging" ? "text-emerald-600" : purgingResult.type === "normal" ? "text-sky-600" : "text-red-600"}`}>
                    {purgingResult.type === "purging" ? "check_circle" : purgingResult.type === "normal" ? "check_circle" : "warning"}
                  </span>
                  <span className={`text-sm font-bold ${purgingResult.type === "purging" ? "text-emerald-700" : purgingResult.type === "normal" ? "text-sky-700" : "text-red-700"}`}>
                    {purgingResult.typeDisplay}
                  </span>
                  <span className="ml-auto text-[10px] text-muted">{Math.round(purgingResult.confidence * 100)}% confidence</span>
                </div>
                <p className="text-sm text-slate-700">{purgingResult.description}</p>
              </div>
              {purgingResult.recommendations.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs font-bold text-slate-700 block mb-2">Rekomendasi:</span>
                  {purgingResult.recommendations.map((r, i) => (
                    <p key={i} className="text-xs text-slate-600 flex items-start gap-1 mb-1">
                      <span className="text-primary font-bold shrink-0">{i + 1}.</span> {r}
                    </p>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-muted italic">{purgingResult.disclaimer}</p>
            </div>
          )}
        </div>
      </section>

      {/* History */}
      <section className="px-6 mb-8">
        <div className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-500">history</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">Riwayat Scan</h3>
              <p className="text-xs text-muted">Hasil analisis sebelumnya</p>
            </div>
            <Link href="/progress" className="btn-press text-xs font-bold text-primary px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors">
              Lihat Semua
            </Link>
          </div>
          {historyLoading ? (
            <div className="flex items-center justify-center gap-3 py-6">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          ) : scansWithAnalysis.length === 0 ? (
            <div className="py-6 text-center">
              <span className="material-symbols-outlined text-3xl text-muted-light block mb-2">photo_library</span>
              <p className="text-xs text-muted">Belum ada riwayat scan. Upload foto untuk memulai.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scansWithAnalysis.slice(0, 5).map((scan) => {
                const a = scan.ai_analysis;
                const isPurging = scan.analysis_type === "purging";
                const label = isPurging
                  ? a?.type === "purging" ? "Purging" : a?.type === "breakout" ? "Breakout" : a?.type === "normal" ? "Normal" : "Belum dianalisis"
                  : a?.types?.join(", ") || "Belum dianalisis";
                const badgeColor = isPurging
                  ? a?.type === "purging" ? "bg-emerald-50 text-emerald-700" : a?.type === "breakout" ? "bg-red-50 text-red-700" : a?.type === "normal" ? "bg-sky-50 text-sky-700" : "bg-slate-50 text-slate-600"
                  : a?.severity === "mild" ? "bg-emerald-50 text-emerald-700" : a?.severity === "moderate" ? "bg-amber-50 text-amber-700" : a?.severity === "informative" && a?.types?.length === 0 ? "bg-sky-50 text-sky-700" : "bg-slate-50 text-slate-600";
                const badgeLabel = isPurging
                  ? a?.type === "purging" ? "Purging" : a?.type === "breakout" ? "Breakout" : a?.type === "normal" ? "Normal" : "-"
                  : a?.severity === "mild" ? "Ringan" : a?.severity === "moderate" ? "Sedang" : a?.severity === "informative" && a?.types?.length === 0 ? "Bersih" : a?.severity ? "Observasi" : "-";
                return (
                  <div key={scan.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                      <img src={thumbUrlFor(scan.url)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{label}</p>
                      <p className="text-[10px] text-muted">{scan.date}{isPurging && a?.product_name ? ` · ${a.product_name}` : ""}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${badgeColor}`}>
                      {badgeLabel}
                    </span>
                    <button onClick={() => handleDelete(scan.id)} className="btn-press p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}