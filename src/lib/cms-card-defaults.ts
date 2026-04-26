import { aboutContent } from "@/content/about";
import { capabilitiesContent } from "@/content/capabilities";
import { trustContent } from "@/content/trust";
import { isPlaceholder } from "@/content/_types";

/**
 * Static card-section defaults — auto-seeded into the CMS the first
 * time an admin opens the card manager for a section.
 *
 * Keep in sync with src/content/*.ts so the seed mirrors what the
 * public site shows when the CMS is empty. After auto-seed the CMS
 * becomes the source of truth for that section, so subsequent edits
 * to the static files no longer reach the public site for those
 * sections (a "Reset to default" button hard-deletes + re-seeds).
 *
 * Sections without a defaults entry stay empty until sales adds
 * cards — the factory and team galleries are placeholders in the
 * static content, so there's nothing to seed.
 */

export type StaticCardDefault = {
  title: { en: string; zh: string };
  description: { en: string; zh: string };
  /** Optional path stored in cms_cards.image_path. Local paths
   *  starting with "/" are valid — cmsImageUrl passes them through. */
  image_path?: string | null;
  image_alt?: { en: string; zh: string };
  meta?: Record<string, unknown>;
};

export type StaticGroupDefault = {
  title: { en: string; zh: string };
  cards: StaticCardDefault[];
};

export function getCardSectionStaticGroups(
  sectionKey: string,
): StaticGroupDefault[] | null {
  switch (sectionKey) {
    case "about.values.items": {
      const en = aboutContent.en.values.items;
      const zh = aboutContent.zh.values.items;
      return [
        {
          // Implicit single group has no visible title.
          title: { en: "", zh: "" },
          cards: en.map((item, i) => {
            const zhItem = zh[i];
            return {
              title: {
                en: item.title,
                zh: zhItem?.title ?? item.title,
              },
              description: {
                en: item.body,
                zh: zhItem?.body ?? item.body,
              },
            };
          }),
        },
      ];
    }
    case "capabilities.customization": {
      const en = capabilitiesContent.en.customization.groups;
      const zh = capabilitiesContent.zh.customization.groups;
      return en.map((group, gi) => {
        const zhGroup = zh[gi];
        return {
          title: {
            en: group.title,
            zh: zhGroup?.title ?? group.title,
          },
          cards: group.items.map((item, ii) => {
            const zhItem = zhGroup?.items[ii];
            return {
              title: {
                en: item.name,
                zh: zhItem?.name ?? item.name,
              },
              description: {
                en: item.note ?? "",
                zh: zhItem?.note ?? item.note ?? "",
              },
            };
          }),
        };
      });
    }
    case "about.events.tradeshows": {
      const en = aboutContent.en.events.gallery.tradeshows.photos;
      const zh = aboutContent.zh.events.gallery.tradeshows.photos;
      return [
        {
          title: { en: "", zh: "" },
          cards: en.map((photo, i) => {
            const zhPhoto = zh[i];
            return {
              title: {
                en: photo.caption,
                zh: zhPhoto?.caption ?? photo.caption,
              },
              description: { en: "", zh: "" },
              image_path: photo.src,
              image_alt: {
                en: photo.caption,
                zh: zhPhoto?.caption ?? photo.caption,
              },
            };
          }),
        },
      ];
    }
    case "trust.credentials": {
      const en = trustContent.en.credentials;
      const zh = trustContent.zh.credentials;
      const cards: StaticCardDefault[] = [];
      for (let i = 0; i < en.length; i++) {
        const enCred = en[i];
        const zhCred = zh[i];
        if (isPlaceholder(enCred) || isPlaceholder(zhCred)) {
          // Placeholders are hints to fill in later, not real credentials —
          // skip them so the seed only mirrors actually-present certs.
          continue;
        }
        const meta: Record<string, unknown> = {};
        if (enCred.issuer || zhCred.issuer) {
          meta.issuer = {
            en: enCred.issuer ?? null,
            zh: zhCred.issuer ?? null,
          };
        }
        if (enCred.validity || zhCred.validity) {
          meta.validity = {
            en: enCred.validity ?? null,
            zh: zhCred.validity ?? null,
          };
        }
        cards.push({
          title: { en: enCred.title, zh: zhCred.title ?? enCred.title },
          description: {
            en: enCred.subtitle ?? "",
            zh: zhCred.subtitle ?? enCred.subtitle ?? "",
          },
          image_path: enCred.image ?? null,
          image_alt: enCred.imageAlt
            ? {
                en: enCred.imageAlt,
                zh: zhCred.imageAlt ?? enCred.imageAlt,
              }
            : undefined,
          meta: Object.keys(meta).length > 0 ? meta : undefined,
        });
      }
      if (cards.length === 0) return null;
      return [{ title: { en: "", zh: "" }, cards }];
    }
    default:
      return null;
  }
}

export function hasCardSectionStaticGroups(sectionKey: string): boolean {
  return getCardSectionStaticGroups(sectionKey) !== null;
}
