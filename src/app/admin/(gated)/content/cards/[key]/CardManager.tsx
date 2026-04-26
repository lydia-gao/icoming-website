"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cmsImageUrl, type CmsCardRow, type CmsGroupRow } from "@/lib/cms";
import type { CardMetaField, CardSectionSchema } from "@/lib/cms-schemas";
import {
  MAX_CMS_IMAGE_BYTES,
  isAcceptedCmsImage,
  uploadCmsImage,
} from "@/lib/cms-uploads";

type BilingualPair = { en: string; zh: string };
type MetaValue = BilingualPair | string;

type Props = {
  schema: CardSectionSchema;
  initialGroups: CmsGroupRow[];
  initialCards: CmsCardRow[];
  initialDeletedGroups: CmsGroupRow[];
  initialDeletedCards: CmsCardRow[];
  hasStaticDefaults: boolean;
};

type EditTarget =
  | null
  | { type: "new-card"; groupId: string | null }
  | { type: "edit-card"; cardId: string }
  | { type: "new-group" }
  | { type: "edit-group"; groupId: string };

export function CardManager({
  schema,
  initialGroups,
  initialCards,
  initialDeletedGroups,
  initialDeletedCards,
  hasStaticDefaults,
}: Props) {
  const router = useRouter();
  const [groups, setGroups] = useState<CmsGroupRow[]>(initialGroups);
  const [cards, setCards] = useState<CmsCardRow[]>(initialCards);
  const [deletedGroups, setDeletedGroups] =
    useState<CmsGroupRow[]>(initialDeletedGroups);
  const [deletedCards, setDeletedCards] =
    useState<CmsCardRow[]>(initialDeletedCards);
  const [editing, setEditing] = useState<EditTarget>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const cardsByGroup = useMemo(() => {
    const map = new Map<string, CmsCardRow[]>();
    for (const card of cards) {
      const list = map.get(card.group_id) ?? [];
      list.push(card);
      map.set(card.group_id, list);
    }
    return map;
  }, [cards]);

  const isMultiGroup = schema.allowGroupCRUD;

  // ---------- Card handlers ----------

  function handleCardSaved(saved: CmsCardRow) {
    setCards((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx === -1) return [...prev, saved];
      const next = [...prev];
      next[idx] = saved;
      return next;
    });
    // The server may have auto-created a single-group; refresh page state
    // so the next load sees the latest groups list.
    setEditing(null);
    router.refresh();
  }

  async function handleCardDelete(id: string) {
    if (
      !window.confirm(
        "Delete this card? It will be removed from the site immediately.",
      )
    ) {
      return;
    }
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/cms/cards/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        window.alert(body.error ?? "Delete failed");
        return;
      }
      setCards((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleCardMove(
    groupId: string,
    cardId: string,
    delta: -1 | 1,
  ) {
    const groupCards = cardsByGroup.get(groupId) ?? [];
    const idx = groupCards.findIndex((c) => c.id === cardId);
    if (idx === -1) return;
    const target = idx + delta;
    if (target < 0 || target >= groupCards.length) return;

    const reordered = [...groupCards];
    [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
    const others = cards.filter((c) => c.group_id !== groupId);
    const previousCards = cards;
    setCards([...others, ...reordered]);

    const res = await fetch("/api/admin/cms/cards/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((c) => c.id) }),
    });
    if (!res.ok) {
      setCards(previousCards);
    } else {
      router.refresh();
    }
  }

  // ---------- Group handlers ----------

  function handleGroupSaved(saved: CmsGroupRow) {
    setGroups((prev) => {
      const idx = prev.findIndex((g) => g.id === saved.id);
      if (idx === -1) return [...prev, saved];
      const next = [...prev];
      next[idx] = saved;
      return next;
    });
    setEditing(null);
    router.refresh();
  }

  async function handleGroupDelete(id: string) {
    const groupCards = cardsByGroup.get(id) ?? [];
    const message =
      groupCards.length > 0
        ? `Delete this group and its ${groupCards.length} card${groupCards.length === 1 ? "" : "s"}? They will all be removed from the site immediately.`
        : "Delete this group?";
    if (!window.confirm(message)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/cms/groups/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        window.alert(body.error ?? "Delete failed");
        return;
      }
      setGroups((prev) => prev.filter((g) => g.id !== id));
      setCards((prev) => prev.filter((c) => c.group_id !== id));
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleGroupMove(groupId: string, delta: -1 | 1) {
    const idx = groups.findIndex((g) => g.id === groupId);
    if (idx === -1) return;
    const target = idx + delta;
    if (target < 0 || target >= groups.length) return;
    const reordered = [...groups];
    [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
    const previous = groups;
    setGroups(reordered);

    const res = await fetch("/api/admin/cms/groups/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((g) => g.id) }),
    });
    if (!res.ok) {
      setGroups(previous);
    } else {
      router.refresh();
    }
  }

  async function handleRestoreCard(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/cms/cards/${id}/restore`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        window.alert(body.error ?? "Restore failed");
        return;
      }
      const result = (await res.json()) as { card?: CmsCardRow };
      setDeletedCards((prev) => prev.filter((c) => c.id !== id));
      if (result.card) {
        setCards((prev) => [...prev, result.card!]);
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleRestoreGroup(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/cms/groups/${id}/restore`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        window.alert(body.error ?? "Restore failed");
        return;
      }
      const result = (await res.json()) as { group?: CmsGroupRow };
      setDeletedGroups((prev) => prev.filter((g) => g.id !== id));
      if (result.group) {
        setGroups((prev) => [...prev, result.group!]);
      }
      // Cards previously hidden under this group reappear on next render;
      // router.refresh fetches the up-to-date set from the server.
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleReset() {
    if (
      !window.confirm(
        "Reset this section to the current site defaults? Every group, card, and uploaded image you've added here will be removed and replaced with the originals.",
      )
    ) {
      return;
    }
    const res = await fetch(
      `/api/admin/cms/reset/${encodeURIComponent(schema.key)}`,
      { method: "POST" },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      window.alert(body.error ?? "Reset failed");
      return;
    }
    router.refresh();
  }

  // ---------- Render ----------

  const totalCards = cards.length;

  // For single-group sections, we render exactly one "section" using
  // the first existing group, or a placeholder when there's no group
  // yet. The implicit single group is created server-side on first
  // card POST.
  const visibleGroups = isMultiGroup ? groups : groups.slice(0, 1);
  const showEmptySingleGroup = !isMultiGroup && groups.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-ink-600">
          {isMultiGroup
            ? `${groups.length} group${groups.length === 1 ? "" : "s"} · ${totalCards} card${totalCards === 1 ? "" : "s"}`
            : totalCards === 0
            ? "No cards yet."
            : `${totalCards} card${totalCards === 1 ? "" : "s"}`}
        </div>
        <div className="flex items-center gap-2">
          {hasStaticDefaults && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-clay-500/50 hover:text-clay-600"
              title="Replace everything in this section with the current site defaults"
            >
              Reset to default
            </button>
          )}
          {isMultiGroup ? (
            <button
              type="button"
              onClick={() => setEditing({ type: "new-group" })}
              disabled={editing?.type === "new-group"}
              className="btn-primary text-sm disabled:opacity-50"
            >
              + Add group
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setEditing({
                  type: "new-card",
                  groupId: groups[0]?.id ?? null,
                })
              }
              disabled={editing?.type === "new-card"}
              className="btn-primary text-sm disabled:opacity-50"
            >
              + Add card
            </button>
          )}
        </div>
      </div>

      {editing?.type === "new-group" && (
        <Pane>
          <GroupForm
            schema={schema}
            initial={null}
            onSaved={handleGroupSaved}
            onCancel={() => setEditing(null)}
          />
        </Pane>
      )}

      {!isMultiGroup && editing?.type === "new-card" && (
        <Pane>
          <CardForm
            schema={schema}
            initial={null}
            sectionKey={schema.key}
            groupId={editing.groupId}
            onSaved={handleCardSaved}
            onCancel={() => setEditing(null)}
          />
        </Pane>
      )}

      {showEmptySingleGroup && editing?.type !== "new-card" && (
        <div className="rounded-2xl border border-dashed border-ink-100 bg-white/60 p-8 text-center text-sm text-ink-500">
          No cards yet — click <span className="font-semibold">+ Add card</span>{" "}
          above to start customizing this section.
        </div>
      )}

      {visibleGroups.map((group, gi) => {
        const groupCards = cardsByGroup.get(group.id) ?? [];
        const isEditingThisGroup =
          editing?.type === "edit-group" && editing.groupId === group.id;
        const isAddingCardHere =
          editing?.type === "new-card" && editing.groupId === group.id;

        return (
          <section key={group.id} className="space-y-4">
            {isMultiGroup &&
              (isEditingThisGroup ? (
                <Pane>
                  <GroupForm
                    schema={schema}
                    initial={group}
                    onSaved={handleGroupSaved}
                    onCancel={() => setEditing(null)}
                  />
                </Pane>
              ) : (
                <GroupHeader
                  group={group}
                  isFirst={gi === 0}
                  isLast={gi === visibleGroups.length - 1}
                  busy={busyId === group.id}
                  onEdit={() =>
                    setEditing({ type: "edit-group", groupId: group.id })
                  }
                  onDelete={() => handleGroupDelete(group.id)}
                  onMoveUp={() => handleGroupMove(group.id, -1)}
                  onMoveDown={() => handleGroupMove(group.id, 1)}
                />
              ))}

            {isMultiGroup && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setEditing({ type: "new-card", groupId: group.id })
                  }
                  disabled={isAddingCardHere}
                  className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-moss-500 hover:text-moss-700 disabled:opacity-50"
                >
                  + Add card to this group
                </button>
              </div>
            )}

            {isAddingCardHere && (
              <Pane>
                <CardForm
                  schema={schema}
                  initial={null}
                  sectionKey={schema.key}
                  groupId={group.id}
                  onSaved={handleCardSaved}
                  onCancel={() => setEditing(null)}
                />
              </Pane>
            )}

            {groupCards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink-100 bg-white/40 p-6 text-center text-xs text-ink-500">
                No cards in this group yet.
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupCards.map((card, ci) =>
                  editing?.type === "edit-card" &&
                  editing.cardId === card.id ? (
                    <li
                      key={card.id}
                      className="sm:col-span-2 lg:col-span-3"
                    >
                      <Pane>
                        <CardForm
                          schema={schema}
                          initial={card}
                          sectionKey={schema.key}
                          groupId={card.group_id}
                          onSaved={handleCardSaved}
                          onCancel={() => setEditing(null)}
                        />
                      </Pane>
                    </li>
                  ) : (
                    <li key={card.id}>
                      <CardTile
                        card={card}
                        isFirst={ci === 0}
                        isLast={ci === groupCards.length - 1}
                        busy={busyId === card.id}
                        onEdit={() =>
                          setEditing({ type: "edit-card", cardId: card.id })
                        }
                        onDelete={() => handleCardDelete(card.id)}
                        onMoveUp={() =>
                          handleCardMove(group.id, card.id, -1)
                        }
                        onMoveDown={() =>
                          handleCardMove(group.id, card.id, 1)
                        }
                      />
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>
        );
      })}

      {(deletedGroups.length > 0 || deletedCards.length > 0) && (
        <DeletedPanel
          schema={schema}
          deletedGroups={deletedGroups}
          deletedCards={deletedCards}
          activeGroups={groups}
          busyId={busyId}
          onRestoreCard={handleRestoreCard}
          onRestoreGroup={handleRestoreGroup}
        />
      )}
    </div>
  );
}

function DeletedPanel({
  schema,
  deletedGroups,
  deletedCards,
  activeGroups,
  busyId,
  onRestoreCard,
  onRestoreGroup,
}: {
  schema: CardSectionSchema;
  deletedGroups: CmsGroupRow[];
  deletedCards: CmsCardRow[];
  activeGroups: CmsGroupRow[];
  busyId: string | null;
  onRestoreCard: (id: string) => void;
  onRestoreGroup: (id: string) => void;
}) {
  const total = deletedGroups.length + deletedCards.length;
  const groupTitleById = new Map(
    activeGroups.map((g) => [g.id, g.title_en ?? g.title_zh ?? "(untitled)"]),
  );
  return (
    <details className="rounded-2xl border border-dashed border-ink-100 bg-white/40 p-4 text-sm">
      <summary className="cursor-pointer font-medium text-ink-600 hover:text-ink-900">
        Show deleted ({total}) — restore items removed by mistake
      </summary>
      <div className="mt-4 space-y-5">
        {deletedGroups.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Deleted groups
            </div>
            <ul className="mt-2 space-y-2">
              {deletedGroups.map((g) => (
                <li
                  key={g.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 ring-1 ring-ink-100"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-ink-900">
                      {g.title_en ?? (
                        <span className="italic text-ink-400">No EN title</span>
                      )}
                    </div>
                    <div className="text-xs text-ink-500">
                      {g.title_zh ?? (
                        <span className="italic">尚无中文</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRestoreGroup(g.id)}
                    disabled={busyId === g.id}
                    className="rounded-md border border-moss-500 bg-white px-2.5 py-1 text-xs font-semibold text-moss-700 hover:bg-moss-50 disabled:opacity-50"
                  >
                    Restore group
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {deletedCards.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Deleted cards
            </div>
            <ul className="mt-2 space-y-2">
              {deletedCards.map((c) => {
                const groupTitle =
                  schema.allowGroupCRUD
                    ? groupTitleById.get(c.group_id) ?? "(unknown group)"
                    : null;
                return (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 ring-1 ring-ink-100"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-ink-900">
                        {c.title_en ?? (
                          <span className="italic text-ink-400">
                            No EN title
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-500">
                        {c.title_zh ?? <span className="italic">尚无中文</span>}
                        {groupTitle ? ` · in ${groupTitle}` : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRestoreCard(c.id)}
                      disabled={busyId === c.id}
                      className="rounded-md border border-moss-500 bg-white px-2.5 py-1 text-xs font-semibold text-moss-700 hover:bg-moss-50 disabled:opacity-50"
                    >
                      Restore card
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <p className="text-xs text-ink-400">
          Restoring a group also brings back any cards that were under it
          when it was deleted.
        </p>
      </div>
    </details>
  );
}

function Pane({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-moss-500/30">
      {children}
    </div>
  );
}

// =====================================================================
// Group header
// =====================================================================

function GroupHeader({
  group,
  isFirst,
  isLast,
  busy,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  group: CmsGroupRow;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-ink-100">
      <div className="min-w-0">
        <h3 className="font-serif text-base font-semibold text-ink-900">
          {group.title_en ?? (
            <span className="italic text-ink-400">No EN title</span>
          )}
        </h3>
        <div className="text-xs text-ink-500">
          {group.title_zh ?? <span className="italic">尚无中文</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst || busy}
          className="rounded-md border border-ink-100 px-2 py-1 text-xs text-ink-600 hover:border-ink-300 disabled:opacity-30"
          aria-label="Move group up"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast || busy}
          className="rounded-md border border-ink-100 px-2 py-1 text-xs text-ink-600 hover:border-ink-300 disabled:opacity-30"
          aria-label="Move group down"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          className="rounded-md border border-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-700 hover:border-moss-500 hover:text-moss-700"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="rounded-md border border-ink-100 px-2.5 py-1 text-xs font-medium text-clay-600 hover:border-clay-500/50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// Group form (multi-group only)
// =====================================================================

function GroupForm({
  schema,
  initial,
  onSaved,
  onCancel,
}: {
  schema: CardSectionSchema;
  initial: CmsGroupRow | null;
  onSaved: (group: CmsGroupRow) => void;
  onCancel: () => void;
}) {
  const [titleEn, setTitleEn] = useState(initial?.title_en ?? "");
  const [titleZh, setTitleZh] = useState(initial?.title_zh ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        title_en: titleEn || null,
        title_zh: titleZh || null,
      };
      const url = initial
        ? `/api/admin/cms/groups/${initial.id}`
        : `/api/admin/cms/groups`;
      const method = initial ? "PATCH" : "POST";
      if (!initial) payload.section_key = schema.key;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Save failed");
      }
      const result = (await res.json()) as { group?: CmsGroupRow };
      if (!result.group) throw new Error("Server returned no group");
      onSaved(result.group);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-ink-900">
        {initial ? "Edit group" : "New group"}
      </div>
      <BilingualLabeledRow
        label="Group title"
        help={`Shown as a heading above the cards (e.g. "Printing methods").`}
        en={titleEn}
        zh={titleZh}
        onChangeEn={setTitleEn}
        onChangeZh={setTitleZh}
      />
      {error && <div className="text-xs text-clay-600">{error}</div>}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-sm"
        >
          {saving ? "Saving…" : initial ? "Save changes" : "Add group"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-sm font-semibold text-ink-700 hover:border-ink-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// Card tile (read-only view)
// =====================================================================

function CardTile({
  card,
  isFirst,
  isLast,
  busy,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  card: CmsCardRow;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const url = cmsImageUrl(card.image_path);
  return (
    <article className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100">
      <div className="relative aspect-[4/3] bg-sand-100">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={card.title_en ?? card.title_zh ?? ""}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-400">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-sm font-semibold text-ink-900">
          {card.title_en ?? (
            <span className="italic text-ink-400">No EN title</span>
          )}
        </div>
        <div className="mt-0.5 text-xs text-ink-500">
          {card.title_zh ?? <span className="italic">尚无中文</span>}
        </div>
        {card.description_en && (
          <div className="mt-2 line-clamp-2 text-xs text-ink-500">
            {card.description_en}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst || busy}
            className="rounded-md border border-ink-100 px-2 py-1 text-xs font-medium text-ink-600 hover:border-ink-300 disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast || busy}
            className="rounded-md border border-ink-100 px-2 py-1 text-xs font-medium text-ink-600 hover:border-ink-300 disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onEdit}
            disabled={busy}
            className="ml-auto rounded-md border border-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-700 hover:border-moss-500 hover:text-moss-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="rounded-md border border-ink-100 px-2.5 py-1 text-xs font-medium text-clay-600 hover:border-clay-500/50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

// =====================================================================
// Card form (create / edit)
// =====================================================================

function CardForm({
  schema,
  initial,
  sectionKey,
  groupId,
  onSaved,
  onCancel,
}: {
  schema: CardSectionSchema;
  initial: CmsCardRow | null;
  sectionKey: string;
  groupId: string | null;
  onSaved: (card: CmsCardRow) => void;
  onCancel: () => void;
}) {
  const metaSchema = schema.cardFields.meta ?? [];
  const [titleEn, setTitleEn] = useState(initial?.title_en ?? "");
  const [titleZh, setTitleZh] = useState(initial?.title_zh ?? "");
  const [descEn, setDescEn] = useState(initial?.description_en ?? "");
  const [descZh, setDescZh] = useState(initial?.description_zh ?? "");
  const [imagePath, setImagePath] = useState<string | null>(
    initial?.image_path ?? null,
  );
  const [metaValues, setMetaValues] = useState<Record<string, MetaValue>>(
    () => initialMetaValues(metaSchema, initial?.meta),
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showDescription = !!schema.cardFields.description;
  const showImage = !!schema.cardFields.image;
  const previewUrl = cmsImageUrl(imagePath);

  function setMetaBilingual(key: string, locale: "en" | "zh", v: string) {
    setMetaValues((prev) => {
      const current = prev[key];
      const pair: BilingualPair =
        current && typeof current === "object"
          ? (current as BilingualPair)
          : { en: "", zh: "" };
      return { ...prev, [key]: { ...pair, [locale]: v } };
    });
  }

  function setMetaText(key: string, v: string) {
    setMetaValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleFileChange(file: File | null) {
    setError(null);
    if (!file) return;
    if (!isAcceptedCmsImage(file)) {
      setError("That file type isn't supported. Use JPG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > MAX_CMS_IMAGE_BYTES) {
      setError("That file is too large (10 MB max).");
      return;
    }
    setUploading(true);
    const result = await uploadCmsImage(file);
    setUploading(false);
    if (!result) {
      setError("Upload failed. Check your connection and try again.");
      return;
    }
    setImagePath(result.path);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        title_en: titleEn || null,
        title_zh: titleZh || null,
        image_path: imagePath,
      };
      if (showDescription) {
        payload.description_en = descEn || null;
        payload.description_zh = descZh || null;
      }
      if (metaSchema.length > 0) {
        payload.meta = serializeMeta(metaSchema, metaValues);
      }
      const url = initial
        ? `/api/admin/cms/cards/${initial.id}`
        : `/api/admin/cms/cards`;
      const method = initial ? "PATCH" : "POST";
      if (!initial) {
        payload.section_key = sectionKey;
        if (groupId) payload.group_id = groupId;
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Save failed");
      }
      const result = (await res.json()) as { card?: CmsCardRow };
      if (!result.card) throw new Error("Server returned no card");
      onSaved(result.card);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const titleLabel = schema.cardFields.title?.label ?? "Title";

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-ink-900">
        {initial ? "Edit card" : "New card"}
      </div>

      {showImage && (
        <div>
          <div className="text-sm font-medium text-ink-700">
            {schema.cardFields.image?.label ?? "Image"}
          </div>
          {schema.cardFields.image?.help && (
            <p className="text-xs text-ink-500">
              {schema.cardFields.image.help}
            </p>
          )}
          <div className="mt-2 flex items-start gap-4">
            <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-xl bg-sand-100 ring-1 ring-ink-100">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-ink-400">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-col items-start gap-2 text-sm">
              <label className="cursor-pointer rounded-md border border-ink-100 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-moss-500 hover:text-moss-700">
                {uploading
                  ? "Uploading…"
                  : imagePath
                  ? "Replace image"
                  : "Upload image"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] ?? null)
                  }
                  disabled={uploading}
                />
              </label>
              {imagePath && (
                <button
                  type="button"
                  onClick={() => setImagePath(null)}
                  disabled={uploading}
                  className="text-xs font-medium text-clay-600 hover:text-clay-700"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <BilingualLabeledRow
        label={titleLabel}
        help={schema.cardFields.title?.help}
        en={titleEn}
        zh={titleZh}
        onChangeEn={setTitleEn}
        onChangeZh={setTitleZh}
      />

      {showDescription && (
        <BilingualLabeledRow
          label={schema.cardFields.description?.label ?? "Description"}
          help={schema.cardFields.description?.help}
          en={descEn}
          zh={descZh}
          onChangeEn={setDescEn}
          onChangeZh={setDescZh}
          multiline
        />
      )}

      {metaSchema.map((field) =>
        field.type === "bilingual" ? (
          <BilingualLabeledRow
            key={field.key}
            label={field.label}
            help={field.help}
            en={(metaValues[field.key] as BilingualPair | undefined)?.en ?? ""}
            zh={(metaValues[field.key] as BilingualPair | undefined)?.zh ?? ""}
            onChangeEn={(v) => setMetaBilingual(field.key, "en", v)}
            onChangeZh={(v) => setMetaBilingual(field.key, "zh", v)}
          />
        ) : (
          <label key={field.key} className="block text-sm">
            <span className="text-sm font-medium text-ink-700">
              {field.label}
            </span>
            {field.help && (
              <p className="text-xs text-ink-500">{field.help}</p>
            )}
            <input
              type="text"
              value={(metaValues[field.key] as string) ?? ""}
              onChange={(e) => setMetaText(field.key, e.target.value)}
              className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
            />
          </label>
        ),
      )}

      {error && <div className="text-xs text-clay-600">{error}</div>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="btn-primary text-sm"
        >
          {saving ? "Saving…" : initial ? "Save changes" : "Add card"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-sm font-semibold text-ink-700 hover:border-ink-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// Meta-field helpers
// =====================================================================

function initialMetaValues(
  metaSchema: CardMetaField[],
  stored: Record<string, unknown> | undefined | null,
): Record<string, MetaValue> {
  const out: Record<string, MetaValue> = {};
  for (const field of metaSchema) {
    const raw = stored?.[field.key];
    if (field.type === "bilingual") {
      out[field.key] = readBilingual(raw);
    } else {
      out[field.key] = typeof raw === "string" ? raw : "";
    }
  }
  return out;
}

function readBilingual(value: unknown): BilingualPair {
  if (!value || typeof value !== "object") return { en: "", zh: "" };
  const obj = value as Record<string, unknown>;
  return {
    en: typeof obj.en === "string" ? obj.en : "",
    zh: typeof obj.zh === "string" ? obj.zh : "",
  };
}

function serializeMeta(
  metaSchema: CardMetaField[],
  values: Record<string, MetaValue>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of metaSchema) {
    const v = values[field.key];
    if (field.type === "bilingual") {
      const pair = (v as BilingualPair | undefined) ?? { en: "", zh: "" };
      const en = pair.en.trim();
      const zh = pair.zh.trim();
      if (!en && !zh) continue;
      out[field.key] = {
        en: en || null,
        zh: zh || null,
      };
    } else {
      const s = typeof v === "string" ? v.trim() : "";
      if (s) out[field.key] = s;
    }
  }
  return out;
}

// =====================================================================
// Shared bilingual field
// =====================================================================

function BilingualLabeledRow({
  label,
  help,
  en,
  zh,
  onChangeEn,
  onChangeZh,
  multiline,
}: {
  label: string;
  help?: string;
  en: string;
  zh: string;
  onChangeEn: (v: string) => void;
  onChangeZh: (v: string) => void;
  multiline?: boolean;
}) {
  const enHas = en.trim().length > 0;
  const zhHas = zh.trim().length > 0;
  const onlyOne = (enHas && !zhHas) || (zhHas && !enHas);
  return (
    <fieldset className="space-y-1">
      <legend className="text-sm font-medium text-ink-700">{label}</legend>
      {help && <p className="text-xs text-ink-500">{help}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <LocaleField
          locale="English"
          value={en}
          onChange={onChangeEn}
          multiline={multiline}
          warn={onlyOne && !enHas}
        />
        <LocaleField
          locale="中文"
          value={zh}
          onChange={onChangeZh}
          multiline={multiline}
          warn={onlyOne && !zhHas}
        />
      </div>
    </fieldset>
  );
}

function LocaleField({
  locale,
  value,
  onChange,
  multiline,
  warn,
}: {
  locale: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  warn?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-ink-500">{locale}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
        />
      )}
      {warn && (
        <span className="mt-1 block text-xs text-clay-600">
          Missing — falls back to default.
        </span>
      )}
    </label>
  );
}
