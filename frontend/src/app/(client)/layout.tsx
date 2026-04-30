// src/app/(client)/layout.tsx
"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Toaster duration={2000} position="top-right" richColors />
      <Footer />
    </>
  );
}
