"use client";

import { useState, useEffect } from "react";
import { Spa, Menu, X } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { href: "#features", label: "Fitur" },
  { href: "#how-it-works", label: "Cara Kerja" },
  { href: "#pricing", label: "Harga" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "nav-blur shadow-sm" : ""
      }`}
    >
      <div className="container-narrow py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Spa className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900">Narehat</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-muted hover:text-primary transition-colors px-3 py-2"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#cta"
            className="btn-press ml-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20"
          >
            Mulai Gratis
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="w-6 h-6 text-slate-700" />
          ) : (
            <Menu className="w-6 h-6 text-slate-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden nav-blur border-t border-border-subtle">
          <div className="container-narrow py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-muted hover:text-primary transition-colors px-3 py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#cta"
              className="btn-press mt-2 px-4 py-3 bg-primary text-white text-sm font-bold rounded-xl text-center"
              onClick={() => setMobileOpen(false)}
            >
              Mulai Gratis
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
