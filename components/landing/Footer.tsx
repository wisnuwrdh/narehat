import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const footerLinks = {
  produk: [
    { label: "Fitur", href: "#features" },
    { label: "Harga", href: "#pricing" },
    { label: "Download App", href: "#" },
  ],
  perusahaan: [
    { label: "Tentang Kami", href: "/about" },
    { label: "Blog", href: "#" },
    { label: "Kontak", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="py-10 px-5 bg-slate-900 lg:py-16">
      <div className="container-narrow">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Logo size={32} className="text-white" />
            </div>
            <p className="text-xs lg:text-sm text-white/50 leading-relaxed max-w-xs">
              Jurnal jerawat cerdas yang membantumu memahami pemicu personal jerawatmu.
            </p>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
                {group}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs lg:text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] lg:text-xs text-white/40">
            &copy; {new Date().getFullYear()} Narehat. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-[11px] lg:text-xs text-white/40 hover:text-white/60 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-[11px] lg:text-xs text-white/40 hover:text-white/60 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
