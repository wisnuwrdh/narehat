"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/products?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          setInitialData({
            id: data.product.id,
            name: data.product.name,
            brand: data.product.brand,
            category: data.product.category,
            description: data.product.description,
            price: String(data.product.price || ""),
            rating: String(data.product.rating || ""),
            reviews: String(data.product.reviews || ""),
            affiliate_link: data.product.affiliate_link || "",
            image_url: data.product.image_url || "",
            ingredients: data.product.ingredients || "",
            why: data.product.why || "",
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

  return <ProductForm initialData={initialData as any} />;
}