/**
 * CORE COMPANY DATA
 * -----------------
 * Shared across the whole site. Update here = updated everywhere.
 *
 * Only verified info below. Fabricated claims (e.g. "exports to 30+
 * countries") have been removed — when those facts are confirmed,
 * add them back here or to the appropriate content/*.ts file.
 */

export const company = {
  legalName: "Pingyang Icom Bag Co., Ltd.",
  brand: "ICOMing",
  tagline:
    "Eco-friendly bag manufacturer — cotton totes, non-woven shoppers, cooler bags, and custom packaging.",
  foundedYear: 2006,
  factorySqM: 2000,
  workers: 30,

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
} as const;

export type Company = typeof company;
