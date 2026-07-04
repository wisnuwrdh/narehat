"use client";

import Link from "next/link";
import { Spa } from "lucide-react";

const footerLinks = {
  produk: [
    { label: "Fitur", href: "#features" },
    { label: "Harga", href: "#pricing" },
    { label: "Download App", href: "#" },
  ],
  perusahaan: [
    { label: "Tentang Kami", href: "#" },
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
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Spa className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">Narehat</span>
            </div>
            <p className="text-xs lg:text-sm text-white/50 leading-relaxed max-w-xs">
              Jurnal jerawat cerdas yang membantumu memahami pemicu personal jerawatmu.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Produk</h4>
            <ul className="space-y-2">
              {footerLinks.produk.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs lg:text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
              Perusahaan
            </h4>
            <ul className="space-y-2">
              {footerLinks.perusahaan.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs lg:text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs lg:text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] lg:text-xs text-white/40">© 2026 Narehat. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[11px] lg:text-xs text-white/40 hover:text-white/60 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-[11px] lg:text-xs text-white/40 hover:text-white/60 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
