"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductForm, ProductFormData } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<(ProductFormData & { id?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/products?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          const p = data.product;
          setInitialData({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            description: p.description || "",
            price: String(p.price || ""),
            rating: String(p.rating || ""),
            reviews: String(p.reviews || ""),
            affiliate_link: p.affiliate_link || "",
            shopee_link: p.shopee_link || "",
            tokopedia_link: p.tokopedia_link || "",
            image_url: p.image_url || "",
            ingredients: p.ingredients || "",
            why: p.why || "",
            skin_types: Array.isArray(p.skin_types) ? p.skin_types : [],
            concerns: Array.isArray(p.concerns) ? p.concerns : [],
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="h-8 bg-slate-50 rounded w-48 animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-sm text-muted">Produk tidak ditemukan</p>
      </div>
    );
  }

  return <ProductForm initialData={initialData} />;
}