import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://narehat.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/onboarding",
          "/admin/",
          "/offline",
          "/dashboard",
          "/scan",
          "/profile",
          "/progress",
          "/recommendations",
          "/routine",
          "/settings",
          "/subscription",
          "/tracker",
          "/ai-consult",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
