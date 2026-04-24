import { placeholder } from "./_types";

/**
 * ABOUT PAGE CONTENT
 * ------------------
 * Anything sourced from the old reference materials is noted as `sourced`.
 * Anything marked with placeholder() needs real business info.
 */

export const aboutContent = {
  hero: {
    eyebrow: "About us",
    headline: "A family factory making bags for the world's brands.",
    body:
      "Pingyang ICom Bag Co., Ltd. is an industrial-and-trade company specializing in the research, development, production, and sales of shopping bags, non-woven bags, packaging bags, suit covers, and takeaway insulation bags.",
  },

  story: {
    eyebrow: "Our story",
    heading: "From trader to trusted manufacturer.",
    paragraphs: [
      // sourced from reference materials (about-us page)
      "We started out as a pure foreign-trade company, sourcing bags for overseas clients. After years of factory visits, sampling runs, and cost negotiations, our clients pushed us to set up our own production so quality could be locked in at the source.",
      // sourced from reference materials
      "The factory is located in Pingyang County; the business department is in Wenzhou City. We run a 2,000 m² production floor with roughly 30 workers and dedicated business teams for overseas accounts.",
      // sourced
      "Most of our customers find us through industry sourcing platforms — and stay with us for years because they can talk to the same people who run the factory floor.",
    ],
  },

  timeline: {
    eyebrow: "Milestones",
    heading: "Our journey so far.",
    // Only 2006 (founding) and the current state are verified. Any
    // intermediate milestones need confirmation from the business team.
    entries: [
      {
        year: "2006",
        title: "Founded",
        body:
          "Pingyang ICom Bag Co., Ltd. established as a foreign-trade company serving overseas bag buyers.",
      },
      placeholder(
        "Milestone #2",
        "Optional: add a key milestone (e.g. year you opened your own factory, first major overseas client, first product line expansion).",
      ),
      placeholder(
        "Milestone #3",
        "Optional: add another milestone (e.g. expansion into cooler/garment bags, certification achievement, major trade-show launch).",
      ),
      {
        year: "Today",
        title: "Serving brands worldwide",
        body:
          "Two sales teams, a dedicated sampling room, and a product catalog spanning 17 categories.",
      },
    ],
  },

  values: {
    eyebrow: "What we value",
    heading: "How we operate.",
    items: [
      {
        title: "Sustainability as default",
        body:
          "We lead with recyclable, biodegradable, and recycled fabrics. Plastic-free packaging on request.",
      },
      {
        title: "Transparent communication",
        body:
          "Honest lead times, honest quantities, honest pricing. No intermediaries filtering messages.",
      },
      {
        title: "Long-term partnership",
        body:
          "Many of our customers have worked with us for years. We're not optimizing for the one-off deal.",
      },
    ],
  },

  // Real trade-show photos are available — surface them here later if you want.
  events: {
    eyebrow: "Events & trade shows",
    heading: "Meet us in person.",
    body: placeholder(
      "Trade-show history",
      "List which trade shows you attend (HK Printing & Packaging Fair, Canton Fair, etc.) and the most recent ones, with dates. Trade-show photos are already available in /public/images/events/.",
    ),
  },

  cta: {
    heading: "Visit our factory (virtually or in person).",
    body:
      "We're happy to share a live walkthrough over video call, or host you at our Pingyang facility.",
    primary: { label: "Contact us", href: "/contact" },
    secondary: { label: "See capabilities", href: "/capabilities" },
  },
};
