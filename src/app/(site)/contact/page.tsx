import type { Metadata } from "next";
import { ContactView } from "@/views/ContactView";
import { uiContent } from "@/content/ui";
import { localizedCompany } from "@/data/company";

const meta = uiContent.en.metadata;
const company = localizedCompany("en");

export const metadata: Metadata = {
  title: meta.contactTitle,
  description: meta.contactDescription(company.brand),
};

export default function Page() {
  return <ContactView locale="en" />;
}
