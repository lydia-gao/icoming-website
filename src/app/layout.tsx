import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InquiryProvider } from "@/lib/inquiry-context";
import { company } from "@/data/company";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${company.brand} — Eco-friendly Bag Manufacturer`,
    template: `%s · ${company.brand}`,
  },
  description: company.tagline,
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <InquiryProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </InquiryProvider>
      </body>
    </html>
  );
}
