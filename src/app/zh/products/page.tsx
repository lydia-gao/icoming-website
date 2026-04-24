import type { Metadata } from "next";
import { ProductsView } from "@/views/ProductsView";
import { uiContent } from "@/content/ui";

export const metadata: Metadata = {
  title: uiContent.zh.productsPage.metaTitle,
  description: uiContent.zh.productsPage.metaDescription,
};

export default function Page() {
  return <ProductsView locale="zh" />;
}
