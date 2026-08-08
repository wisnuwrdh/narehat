import type { Viewport } from "next";

export const viewport: Viewport = {
  maximumScale: 1,
  userScalable: false,
};

export default function RecommendationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
