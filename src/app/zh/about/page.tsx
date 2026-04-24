import type { Metadata } from "next";
import { AboutView } from "@/views/AboutView";
import { localizedCompany } from "@/data/company";
import { uiContent } from "@/content/ui";

const company = localizedCompany("zh");
const meta = uiContent.zh.metadata;

export const metadata: Metadata = {
  title: meta.aboutTitle,
  description: meta.aboutDescription(company.legalName, company.foundedYear),
};

export default function Page() {
  return <AboutView locale="zh" />;
}
