import type { Metadata } from "next";
import { ContactView } from "@/views/ContactView";
import { uiContent } from "@/content/ui";
import { localizedCompany } from "@/data/company";

const meta = uiContent.zh.metadata;
const company = localizedCompany("zh");

export const metadata: Metadata = {
  title: meta.contactTitle,
  description: meta.contactDescription(company.brand),
};

export default function Page() {
  return <ContactView locale="zh" />;
}
