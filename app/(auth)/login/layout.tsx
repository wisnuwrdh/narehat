import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Masuk",
  description:
    "Masuk ke akun Narehat untuk melacak jerawatmu, upload foto progress, dan dapatkan analisis AI yang personal.",
  alternates: { canonical: "/login" },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
