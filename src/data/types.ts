export type Category = {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription?: string;
  heroImage?: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  slug: string;
  name: string;
  categorySlug: string;
  summary: string;
  description: string;
  images: string[];
  specs: ProductSpec[];
  moq?: string;
  leadTime?: string;
  customization?: string[];
  materials?: string[];
  featured?: boolean;
};
