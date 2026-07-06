"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "nav-blur shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container-narrow py-3 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2">
          <Logo />
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1">
            <Link href="#features" className="text-sm font-semibold text-muted hover:text-primary transition-colors px-3 py-2">
              Fitur
            </Link>
            <Link href="#how-it-works" className="text-sm font-semibold text-muted hover:text-primary transition-colors px-3 py-2">
              Cara Kerja
            </Link>
            <Link href="#pricing" className="text-sm font-semibold text-muted hover:text-primary transition-colors px-3 py-2">
              Harga
            </Link>
            <Link href="#faq" className="text-sm font-semibold text-muted hover:text-primary transition-colors px-3 py-2">
              FAQ
            </Link>
          </div>
          <Link
            href="/register"
            className="btn-press px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20"
          >
            Mulai Gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}
