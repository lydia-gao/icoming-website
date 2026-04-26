import type { SupabaseClient } from "@supabase/supabase-js";
import { getCardSectionStaticGroups } from "./cms-card-defaults";

/**
 * Insert static defaults for a card section.
 *
 * Returns ok=true with the created group count, or ok=false with an
 * error message. Idempotency is the caller's responsibility — this
 * helper unconditionally inserts; if rows already exist for the
 * section, the seed will create duplicates. Both call sites
 * (auto-seed on first admin render, explicit reset action) check
 * for emptiness or hard-delete first.
 */
export async function seedCardSection(
  supabase: SupabaseClient,
  sectionKey: string,
  userId: string | null,
): Promise<{ ok: true; groupCount: number } | { ok: false; error: string }> {
  const staticGroups = getCardSectionStaticGroups(sectionKey);
  if (!staticGroups || staticGroups.length === 0) {
    return { ok: false, error: "No defaults available for this section" };
  }

  const now = new Date().toISOString();
  for (let gi = 0; gi < staticGroups.length; gi++) {
    const sg = staticGroups[gi];
    const { data: group, error: groupErr } = await supabase
      .from("cms_groups")
      .insert({
        section_key: sectionKey,
        title_en: sg.title.en || null,
        title_zh: sg.title.zh || null,
        position: gi,
        active: true,
        updated_at: now,
        updated_by: userId,
      })
      .select("id")
      .single();

    if (groupErr || !group) {
      return {
        ok: false,
        error: groupErr?.message ?? "Could not create group",
      };
    }

    if (sg.cards.length === 0) continue;

    const cardRows = sg.cards.map((c, ci) => ({
      group_id: group.id,
      title_en: c.title.en || null,
      title_zh: c.title.zh || null,
      description_en: c.description.en || null,
      description_zh: c.description.zh || null,
      image_path: c.image_path ?? null,
      image_alt_en: c.image_alt?.en ?? null,
      image_alt_zh: c.image_alt?.zh ?? null,
      position: ci,
      active: true,
      meta: c.meta ?? {},
      updated_at: now,
      updated_by: userId,
    }));
    const { error: cardsErr } = await supabase
      .from("cms_cards")
      .insert(cardRows);
    if (cardsErr) {
      return { ok: false, error: cardsErr.message };
    }
  }

  return { ok: true, groupCount: staticGroups.length };
}

/**
 * Hard-delete all groups (and cards via cascade) for a section, then
 * re-seed from static defaults if any exist.
 *
 * Used by the "Reset to default" admin action.
 */
export async function resetCardSection(
  supabase: SupabaseClient,
  sectionKey: string,
  userId: string | null,
): Promise<{ ok: true; groupCount: number } | { ok: false; error: string }> {
  const { error: deleteErr } = await supabase
    .from("cms_groups")
    .delete()
    .eq("section_key", sectionKey);

  if (deleteErr) {
    return { ok: false, error: deleteErr.message };
  }

  const staticGroups = getCardSectionStaticGroups(sectionKey);
  if (!staticGroups || staticGroups.length === 0) {
    // No defaults — section is now empty, that's the expected outcome.
    return { ok: true, groupCount: 0 };
  }

  return seedCardSection(supabase, sectionKey, userId);
}
