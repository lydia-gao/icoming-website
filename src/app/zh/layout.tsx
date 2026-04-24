import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LocaleProvider } from "@/lib/locale-context";
import { localizedCompany } from "@/data/company";
import { uiContent } from "@/content/ui";

const company = localizedCompany("zh");
const ui = uiContent.zh.metadata;

export const metadata: Metadata = {
  title: {
    default: `${company.brand} — ${ui.defaultTitle}`,
    template: `%s · ${company.brand}`,
  },
  description: company.tagline,
};

export default function ZhLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider locale="zh">
      <Header />
      <main lang="zh-CN" className="flex-1">{children}</main>
      <Footer locale="zh" />
    </LocaleProvider>
  );
}
