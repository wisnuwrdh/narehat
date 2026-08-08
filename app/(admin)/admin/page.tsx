import Link from "next/link";

const MENU_ITEMS: { title: string; desc: string; icon: string; href?: string; soon?: boolean }[] = [
  {
    title: "Produk Rekomendasi",
    desc: "Kelola katalog produk, link beli, dan gambar",
    icon: "inventory_2",
    href: "/admin/products",
  },
  {
    title: "Kelola User",
    desc: "Lihat pengguna, onboarding, dan riwayat pembayaran",
    icon: "group",
    href: "/admin/users",
  },
  {
    title: "Menu Lainnya",
    desc: "Fitur admin tambahan segera hadir",
    icon: "more_horiz",
    soon: true,
  },
];

export default function AdminPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
        <p className="text-sm text-muted">Kelola konten dan pengaturan Narehat</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {MENU_ITEMS.map((item) => {
          const card = (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary-light text-primary">
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                {item.soon && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                    Segera
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-800">{item.title}</h3>
              <p className="text-xs text-muted mt-1">{item.desc}</p>
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.title}
                href={item.href}
                className="btn-press bg-white border border-border-subtle rounded-2xl p-5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
              >
                {card}
              </Link>
            );
          }

          return (
            <div
              key={item.title}
              className="bg-white border border-border-subtle rounded-2xl p-5 opacity-50 cursor-not-allowed select-none"
            >
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
