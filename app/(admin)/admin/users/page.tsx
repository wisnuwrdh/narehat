"use client";

import { useCallback, useEffect, useState } from "react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  plan_expires_at: string | null;
  onboarding_completed: boolean;
  role: string;
  created_at: string;
  skin_type: string;
  acne_severity: string;
  goal: string;
}

interface UserProduct {
  name: string;
  brand: string;
  category: string;
  active: boolean;
  created_at: string;
}

interface UserPayment {
  order_id: string;
  plan: string;
  amount: number;
  status: string;
  created_at: string;
}

const SKIN_LABELS: Record<string, string> = {
  oily: "Berminyak", dry: "Kering", combination: "Kombinasi", normal: "Normal", sensitive: "Sensitif",
};
const SEVERITY_LABELS: Record<string, string> = { mild: "Ringan", moderate: "Sedang", severe: "Parah" };
const GOAL_LABELS: Record<string, string> = {
  clear_acne: "Jerawat Hilang", fade_scars: "Bekas Memudar", brighter_skin: "Kulit Cerah",
  anti_aging: "Anti-Aging", barrier: "Skin Barrier", all: "Semua",
};
const PLAN_LABELS: Record<string, string> = {
  free: "Gratis", premium_monthly: "Premium Bulanan", premium_yearly: "Premium Tahunan",
  pro_monthly: "Pro Bulanan", pro_yearly: "Pro Tahunan",
};
const PLAN_OPTIONS = ["free", "premium_monthly", "premium_yearly", "pro_monthly", "pro_yearly"];
const PAYMENT_STATUS_LABELS: Record<string, string> = { pending: "Menunggu", completed: "Selesai", cancelled: "Dibatalkan" };
const FILTER_PLANS = ["", ...PLAN_OPTIONS];

const formatDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

const formatRupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

function planStatus(user: AdminUser): { label: string; color: string } {
  if (user.plan === "free") return { label: "Gratis", color: "bg-slate-100 text-slate-600" };
  const expires = user.plan_expires_at ? new Date(user.plan_expires_at) : null;
  if (!expires || expires.getTime() <= Date.now()) return { label: "Kedaluwarsa", color: "bg-red-50 text-red-600" };
  const days = Math.ceil((expires.getTime() - Date.now()) / 86400000);
  return { label: `${days} hari lagi`, color: "bg-green-50 text-green-600" };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  const [detail, setDetail] = useState<{
    user: AdminUser;
    products: UserProduct[];
    payments: UserPayment[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
      if (search.trim()) params.set("search", search.trim());
      if (plan) params.set("plan", plan);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, plan, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`);
      const data = await res.json();
      if (!data.user) return;
      setDetail({ user: data.user, products: data.products || [], payments: data.payments || [] });
    } catch {
    } finally {
      setDetailLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!detail) return;
    if (!confirm(`Ubah plan "${detail.user.name}" menjadi ${PLAN_LABELS[detail.user.plan] || detail.user.plan}?\nUser akan berganti plan & periode kuota di-reset.`)) return;
    setSavingPlan(true);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: detail.user.id, plan: detail.user.plan }),
      });
      setDetail(null);
      fetchUsers();
    } finally {
      setSavingPlan(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola User</h1>
          <p className="text-sm text-muted">Lihat pengguna, jawaban onboarding, dan riwayat pembayaran</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600">{total} user</span>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <select
          value={plan}
          onChange={(e) => { setPlan(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-slate-50 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          {FILTER_PLANS.map((p) => (
            <option key={p} value={p}>{p === "" ? "Semua Plan" : PLAN_LABELS[p] || p}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-muted-light mb-3">group_off</span>
          <p className="text-sm font-semibold text-slate-600">Tidak ada user ditemukan</p>
        </div>
      ) : (
        <div className="bg-white border border-border-subtle rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-border-subtle bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Nama</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Daftar</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Plan</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Onboarding</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Role</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const ps = planStatus(u);
                return (
                  <tr key={u.id} className="border-b border-border-subtle hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.name || "-"}</td>
                    <td className="px-4 py-3 text-muted">{u.email}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-700">{PLAN_LABELS[u.plan] || u.plan}</span>
                        {u.plan !== "free" && (
                          <span className={`text-[10px] font-bold w-fit px-1.5 py-0.5 rounded ${ps.color}`}>{ps.label}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        u.onboarding_completed ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      }`}>
                        {u.onboarding_completed ? "Sudah" : "Belum"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        u.role === "admin" ? "bg-violet-50 text-violet-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openDetail(u.id)}
                        className="text-primary text-xs font-bold hover:underline"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted">Halaman {page} dari {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-press px-3 py-1.5 text-xs font-bold rounded-lg border border-border-light text-slate-600 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-press px-3 py-1.5 text-xs font-bold rounded-lg border border-border-light text-slate-600 disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center pb-24" onClick={() => setDetail(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-3xl w-full max-w-md p-5 animate-fade-in-up max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Detail User</h3>
              <button onClick={() => setDetail(null)} className="p-1.5 text-muted hover:text-slate-700 rounded-lg hover:bg-slate-50">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="font-bold text-slate-900 text-sm">{detail.user.name || "-"}</p>
            <p className="text-xs text-muted mb-4">{detail.user.email}</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <Info label="Daftar" value={formatDate(detail.user.created_at)} />
              <Info label="Plan" value={PLAN_LABELS[detail.user.plan] || detail.user.plan} />
              <Info label="Role" value={detail.user.role} />
              <Info label="Onboarding" value={detail.user.onboarding_completed ? "Selesai" : "Belum"} />
            </div>

            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Jawaban Onboarding</h4>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Info label="Tipe Kulit" value={SKIN_LABELS[detail.user.skin_type] || detail.user.skin_type} />
              <Info label="Keparahan" value={SEVERITY_LABELS[detail.user.acne_severity] || detail.user.acne_severity} />
              <Info label="Goal" value={GOAL_LABELS[detail.user.goal] || detail.user.goal} />
            </div>

            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Produk Skincare ({detail.products.length})
            </h4>
            {detail.products.length === 0 ? (
              <p className="text-xs text-muted mb-4">Tidak ada produk dicatat.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {detail.products.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                      <p className="text-[10px] text-muted">{p.brand} · {p.category || "-"}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      p.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                    }`}>
                      {p.active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Riwayat Pembayaran ({detail.payments.length})
            </h4>
            {detail.payments.length === 0 ? (
              <p className="text-xs text-muted mb-4">Belum ada pembayaran.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {detail.payments.map((p, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-700">{PLAN_LABELS[p.plan] || p.plan}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        p.status === "completed" ? "bg-emerald-50 text-emerald-600"
                        : p.status === "cancelled" ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-600"
                      }`}>
                        {PAYMENT_STATUS_LABELS[p.status] || p.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted mt-0.5">{formatRupiah(p.amount)} · {p.order_id}</p>
                    <p className="text-[10px] text-muted">{formatDate(p.created_at)}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl mb-3">
              <label className="block text-xs font-bold text-slate-700 mb-2">Ubah Plan (override manual)</label>
              <div className="flex gap-2">
                <select
                  value={detail.user.plan}
                  onChange={(e) => setDetail({ ...detail, user: { ...detail.user, plan: e.target.value } })}
                  className="flex-1 px-3 py-2 bg-white border border-border-light rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p} value={p}>{PLAN_LABELS[p] || p}</option>
                  ))}
                </select>
                <button
                  onClick={handleChangePlan}
                  disabled={savingPlan}
                  className="btn-press px-3 py-2 text-xs font-bold rounded-xl bg-primary text-white disabled:opacity-50"
                >
                  {savingPlan ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl px-5 py-4 text-sm font-semibold text-slate-700">Memuat detail...</div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 bg-slate-50 rounded-xl">
      <p className="text-[10px] text-muted font-semibold">{label}</p>
      <p className="text-xs font-bold text-slate-800">{value}</p>
    </div>
  );
}
