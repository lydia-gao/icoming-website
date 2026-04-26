import type { Locale } from "@/lib/i18n";

/**
 * CORE COMPANY DATA
 * -----------------
 * Shared across the whole site. The base `company` object is the
 * English-language source of truth. For non-English locales, `localizedCompany`
 * merges an overlay from `companyTranslations` — unset fields fall back
 * to English.
 */

export type Company = {
  legalName: string;
  brand: string;
  tagline: string;
  foundedYear: number;
  factorySqM: number;
  workers: number;
  contact: {
    primaryEmail: string;
    secondaryEmail: string;
    phone: string;
    whatsapp: string;
    address: {
      line1: string;
      line2: string;
      region: string;
    };
  };
  social: {
    facebook: string;
    youtube: string;
    pinterest: string;
  };
};

export const company: Company = {
  legalName: "Pingyang Icom Bag Co., Ltd.",
  brand: "ICOM BAG",
  tagline:
    "Eco-friendly bag manufacturer — cotton totes, non-woven shoppers, cooler bags, and custom packaging.",
  foundedYear: 2006,
  factorySqM: 3000,
  workers: 60,

  contact: {
    primaryEmail: "sale1@i-coming.com",
    secondaryEmail: "sale7@i-coming.com",
    phone: "+86-13336976300",
    whatsapp: "+86-18657791652",
    address: {
      line1: "Plaza, No. 2, Chezhan Road",
      line2: "Lucheng District, Wenzhou",
      region: "Zhejiang, China",
    },
  },

  social: {
    facebook: "https://www.facebook.com/I-com-bag-108971397930914",
    youtube: "https://www.youtube.com/channel/UC0qvrkaWN9qvfju0KoNDW0w",
    pinterest: "https://www.pinterest.com/katrinazhou9357/_saved/",
  },
};

type CompanyOverlay = {
  legalName?: string;
  brand?: string;
  tagline?: string;
  contact?: {
    address?: {
      line1?: string;
      line2?: string;
      region?: string;
    };
  };
};

const companyTranslations: Partial<
  Record<Exclude<Locale, "en">, CompanyOverlay>
> = {
  zh: {
    legalName: "平阳爱康箱包有限公司",
    brand: "爱康",
    tagline: "环保袋专业制造商——棉布手提袋、无纺布购物袋、保温袋及定制包装。",
    contact: {
      address: {
        line1: "车站大道 2 号广场",
        line2: "温州市鹿城区",
        region: "中国浙江",
      },
    },
  },
};

export function localizedCompany(locale: Locale): Company {
  if (locale === "en") return company;
  const overlay = companyTranslations[locale as Exclude<Locale, "en">];
  if (!overlay) return company;
  return {
    ...company,
    legalName: overlay.legalName ?? company.legalName,
    brand: overlay.brand ?? company.brand,
    tagline: overlay.tagline ?? company.tagline,
    contact: {
      ...company.contact,
      address: {
        ...company.contact.address,
        ...(overlay.contact?.address ?? {}),
      },
    },
  };
}
