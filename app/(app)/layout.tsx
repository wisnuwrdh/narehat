export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-subtle z-50">
        <div className="max-w-lg mx-auto flex justify-around py-3">
          {[
            { href: "/dashboard", label: "Home" },
            { href: "/tracker", label: "Tracker" },
            { href: "/progress", label: "Progress" },
            { href: "/ai-consult", label: "AI" },
            { href: "/recommendations", label: "Produk" },
          ].map((item) => (
            <a key={item.href} href={item.href} className="flex flex-col items-center gap-1 text-xs font-medium text-muted hover:text-primary transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {item.label}
            </a>
          ))}
        </div>
      </nav>
      <main className="pb-20">{children}</main>
    </div>
  );
}
