import { NextRequest, NextResponse } from "next/server";

const products = [
  {
    id: "1",
    category: "Cleanser",
    name: "Cetaphil Gentle Skin Cleanser",
    brand: "Cetaphil",
    description: "Pembersih lembut untuk kulit sensitif dan berjerawat. Non-comedogenic.",
    price: 89000,
    rating: 4.8,
    reviews: 2100,
    affiliate_link: "https://shopee.co.id/cetaphil-gentle-skin-cleanser",
    image_url: "",
    why: "Formula gentle cocok untuk kulit kombinasi berjerawat. pH balanced.",
  },
  {
    id: "2",
    category: "Treatment",
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    description: "Mengurangi minyak berlebih dan memudarkan bekas jerawat.",
    price: 145000,
    rating: 4.7,
    reviews: 5300,
    affiliate_link: "https://tokopedia.co.id/the-ordinary-niacinamide",
    image_url: "",
    why: "Niacinamide terbukti efektif mengontrol sebum dan mencerahkan bekas jerawat.",
  },
  {
    id: "3",
    category: "Sunscreen",
    name: "Skin Aqua UV Moisture Milk",
    brand: "Skin Aqua",
    description: "SPF 50 PA++++, ringan, tidak greasy, cocok untuk kulit berminyak.",
    price: 65000,
    rating: 4.9,
    reviews: 8700,
    affiliate_link: "https://shopee.co.id/skin-aqua-uv-moisture-milk",
    image_url: "",
    why: "Tekstur milk yang ringan cocok untuk kulit kombinasi. Tidak memicu jerawat.",
  },
  {
    id: "4",
    category: "Moisturizer",
    name: "Hada Labo Gokujyun Premium Lotion",
    brand: "Hada Labo",
    description: "Pelembab dengan hyaluronic acid untuk hidrasi maksimal tanpa menyumbat pori.",
    price: 95000,
    rating: 4.7,
    reviews: 3200,
    affiliate_link: "https://tokopedia.co.id/hada-labo-gokujyun",
    image_url: "",
    why: "Non-comedogenic dan memberikan hidrasi tanpa membuat kulit berminyak.",
  },
  {
    id: "5",
    category: "Cleanser",
    name: "COSRX Low pH Good Morning Gel Cleanser",
    brand: "COSRX",
    description: "Pembersih pagi dengan pH rendah yang menenangkan kulit sensitif.",
    price: 110000,
    rating: 4.6,
    reviews: 4800,
    affiliate_link: "https://shopee.co.id/cosrx-low-ph-gel-cleanser",
    image_url: "",
    why: "pH 5.5 seimbang baik untuk kulit kombinasi yang rentan jerawat.",
  },
  {
    id: "6",
    category: "Treatment",
    name: "Azelaic Acid Suspension 10%",
    brand: "The Ordinary",
    description: "Mencerahkan bekas jerawat dan mengurangi kemerahan.",
    price: 135000,
    rating: 4.5,
    reviews: 2900,
    affiliate_link: "https://tokopedia.co.id/the-ordinary-azelaic-acid",
    image_url: "",
    why: "Azelaic acid aman untuk kulit kombinasi dan membantu meratakan tekstur kulit.",
  },
  {
    id: "7",
    category: "Sunscreen",
    name: "Biore UV Aqua Rich Watery Essence SPF 50",
    brand: "Biore",
    description: "Sunscreen waterproof dengan finish ringan dan tidak putih.",
    price: 75000,
    rating: 4.8,
    reviews: 12500,
    affiliate_link: "https://shopee.co.id/biore-uv-aqua-rich",
    image_url: "",
    why: "Tekstur essence yang ringan tidak akan menyumbat pori. Water resistant.",
  },
  {
    id: "8",
    category: "Moisturizer",
    name: "Illiyoon Ceramide Ato Soothing Gel",
    brand: "Illiyoon",
    description: "Gel pelembab dengan ceramide untuk memperbaiki skin barrier.",
    price: 119000,
    rating: 4.7,
    reviews: 5100,
    affiliate_link: "https://tokopedia.co.id/illiyoon-ceramide-gel",
    image_url: "",
    why: "Formula gel ringan cocok untuk kulit kombinasi yang butuh hidrasi tanpa rasa berat.",
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let filtered = products;
  if (category && category !== "Semua") {
    filtered = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  return NextResponse.json({
    recommendations: filtered,
    total: filtered.length,
  });
}
