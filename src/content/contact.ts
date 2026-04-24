import { company } from "@/data/company";

/**
 * CONTACT PAGE CONTENT
 * --------------------
 * Channels pull their actual details (emails, phone numbers) from
 * data/company.ts — update once there, reflected everywhere.
 */

export const contactContent = {
  hero: {
    eyebrow: "Contact",
    headline: "Let's start your bag project.",
    body:
      "Reach us through whichever channel you prefer. For detailed quotes with product specs, use the inquiry basket with your saved products.",
  },

  channels: [
    {
      label: "Email",
      primary: company.contact.primaryEmail,
      secondary: company.contact.secondaryEmail,
      href: `mailto:${company.contact.primaryEmail}`,
      note: "Usually replied to within one business day.",
    },
    {
      label: "Phone",
      primary: company.contact.phone,
      secondary: "Mon–Sat, GMT+8",
      href: `tel:${company.contact.phone.replace(/[^+\d]/g, "")}`,
      note: "Best for urgent project updates.",
    },
    {
      label: "WhatsApp",
      primary: company.contact.whatsapp,
      secondary: "Same-day reply, GMT+8 hours",
      href: `https://wa.me/${company.contact.whatsapp.replace(/[^\d]/g, "")}`,
      note: "Preferred by many overseas customers.",
    },
  ],

  visit: {
    eyebrow: "Visit",
    heading: "Our factory & office.",
    body:
      "The factory is in Pingyang County; the sales/business office is in Wenzhou. We're happy to schedule a factory visit — let us know your travel dates.",
  },
};
