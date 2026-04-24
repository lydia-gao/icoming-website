import type { Metadata } from "next";
import { ProductsView } from "@/views/ProductsView";
import { uiContent } from "@/content/ui";

export const metadata: Metadata = {
  title: uiContent.en.productsPage.metaTitle,
  description: uiContent.en.productsPage.metaDescription,
};

export default function Page() {
  return <ProductsView locale="en" />;
}
