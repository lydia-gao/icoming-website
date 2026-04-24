import type { Metadata } from "next";
import { CapabilitiesView } from "@/views/CapabilitiesView";
import { uiContent } from "@/content/ui";

const meta = uiContent.en.metadata;

export const metadata: Metadata = {
  title: meta.capabilitiesTitle,
  description: meta.capabilitiesDescription,
};

export default function Page() {
  return <CapabilitiesView locale="en" />;
}
