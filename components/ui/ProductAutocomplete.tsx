"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ProductOption {
  id: string;
  name: string;
  brand: string;
  category: string;
  ingredients: string;
  image_url: string;
}

interface ProductAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string, product?: ProductOption) => void;
}

export function ProductAutocomplete({
  label,
  placeholder,
  value,
  onChange,
}: ProductAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<ProductOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) return;
    const timer = setTimeout(async () => {
      const q = query.trim();
      if (q.length < 2) {
        setResults([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results || []);
        setOpen((data.results || []).length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selected]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(false);
    setQuery(e.target.value);
    onChange(e.target.value);
  };

  const handleSelect = useCallback(
    (product: ProductOption) => {
      setQuery(product.name);
      setSelected(true);
      setOpen(false);
      onChange(product.name, product);
    },
    [onChange]
  );

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        className="w-full px-4 py-3 bg-slate-50 border border-border-light rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
      {loading && (
        <div className="absolute right-4 top-[44px]">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-border-light rounded-2xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-border-subtle last:border-b-0"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-lg text-slate-300">inventory_2</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-slate-800 block truncate">{p.name}</span>
                <span className="text-xs text-muted">{p.brand} · {p.category}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}