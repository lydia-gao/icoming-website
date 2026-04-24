import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { LocaleProvider } from "@/lib/locale-context";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider locale="en">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer locale="en" />
      <WhatsAppButton variant="floating" />
    </LocaleProvider>
  );
}
