/**
 * Shared content types.
 *
 * Convention for unverified business claims:
 * use a Placeholder<T> instead of a real value.
 *
 * This makes it impossible to accidentally ship fabricated claims —
 * the UI renders every placeholder as a clearly-marked "to be provided"
 * block that tells reviewers what needs to be filled in.
 */

export type Placeholder = {
  _placeholder: true;
  /** Short label for what belongs here, e.g. "Export regions". */
  label: string;
  /** A fuller hint for whoever will fill this in. */
  needs: string;
};

export function placeholder(label: string, needs: string): Placeholder {
  return { _placeholder: true, label, needs };
}

export function isPlaceholder(value: unknown): value is Placeholder {
  return (
    typeof value === "object" &&
    value !== null &&
    "_placeholder" in value &&
    (value as { _placeholder: unknown })._placeholder === true
  );
}

/**
 * A metric shown in the hero / trust strip.
 * Either a verified value OR a placeholder.
 */
export type Metric =
  | { label: string; value: string; note?: string }
  | (Placeholder & { label: string });

/**
 * A certification or credential card.
 * Cards with no `image` render as an icon tile; the title/subtitle/issuer
 * still show, so a CMS-managed credential is useful even before the
 * scan has been uploaded.
 */
export type Credential =
  | {
      title: string;
      subtitle?: string;
      image?: string;
      imageAlt?: string;
      issuer?: string;
      validity?: string;
    }
  | Placeholder;
