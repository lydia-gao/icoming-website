"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type {
  BilingualRow,
  ColorRow,
  SpecRow,
} from "./variant-helpers";

type State = {
  sizes: BilingualRow[];
  materials: BilingualRow[];
  customization: BilingualRow[];
  tags: BilingualRow[];
  colors: ColorRow[];
  specs: SpecRow[];
};

type Props = {
  productId: string;
  initial: State;
};

export function VariantOptionsEditor({ productId, initial }: Props) {
  const [state, setState] = useState<State>(initial);
  const [baseline, setBaseline] = useState<State>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const router = useRouter();

  const dirty = useMemo(
    () => JSON.stringify(state) !== JSON.stringify(baseline),
    [state, baseline],
  );

  function setBilingualSection(
    key: "sizes" | "materials" | "customization" | "tags",
    rows: BilingualRow[],
  ) {
    setState((prev) => ({ ...prev, [key]: rows }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        sizes: state.sizes.map((r) => ({
          en: r.en.trim() || null,
          zh: r.zh.trim() || null,
        })),
        materials: state.materials.map((r) => ({
          en: r.en.trim() || null,
          zh: r.zh.trim() || null,
        })),
        customization: state.customization.map((r) => ({
          en: r.en.trim() || null,
          zh: r.zh.trim() || null,
        })),
        tags: state.tags.map((r) => ({
          en: r.en.trim() || null,
          zh: r.zh.trim() || null,
        })),
        colors: state.colors.map((c) => ({
          name_en: c.name_en.trim() || null,
          name_zh: c.name_zh.trim() || null,
          hex: c.hex.trim() || null,
        })),
        specs: state.specs.map((s) => ({
          label_en: s.label_en.trim() || null,
          label_zh: s.label_zh.trim() || null,
          value_en: s.value_en.trim() || null,
          value_zh: s.value_zh.trim() || null,
        })),
      };
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Save failed");
      }
      setBaseline(state);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setState(baseline);
    setError(null);
  }

  return (
    <div className="space-y-6 rounded-2xl bg-white p-5 ring-1 ring-ink-100">
      <div>
        <h2 className="font-serif text-lg font-semibold text-ink-900">
          Variant options & specs
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          What buyers can pick from on the product detail page. Each
          row is bilingual; leave a side blank to skip that locale.
          Save once at the bottom to commit all changes.
        </p>
      </div>

      <BilingualRowSection
        title="Sizes"
        help={`Available sizes (e.g. "Standard 38 x 42 cm").`}
        rows={state.sizes}
        onChange={(rows) => setBilingualSection("sizes", rows)}
        saving={saving}
        placeholders={{
          en: "Standard 38 x 42 cm",
          zh: "标准 38 x 42 cm",
        }}
      />

      <ColorsSection
        rows={state.colors}
        onChange={(rows) => setState((prev) => ({ ...prev, colors: rows }))}
        saving={saving}
      />

      <BilingualRowSection
        title="Materials"
        help="Available materials buyers can specify."
        rows={state.materials}
        onChange={(rows) => setBilingualSection("materials", rows)}
        saving={saving}
        placeholders={{
          en: "Cotton canvas",
          zh: "棉帆布",
        }}
      />

      <BilingualRowSection
        title="Customization options"
        help="Add-ons buyers can request (logo print, inner pocket, etc.)."
        rows={state.customization}
        onChange={(rows) => setBilingualSection("customization", rows)}
        saving={saving}
        placeholders={{
          en: "Logo print",
          zh: "Logo 印刷",
        }}
      />

      <SpecsSection
        rows={state.specs}
        onChange={(rows) => setState((prev) => ({ ...prev, specs: rows }))}
        saving={saving}
      />

      <BilingualRowSection
        title="Tags"
        help="Internal metadata. Not surfaced as filters yet — handy for grouping or future search."
        rows={state.tags}
        onChange={(rows) => setBilingualSection("tags", rows)}
        saving={saving}
        placeholders={{
          en: "Promotional",
          zh: "宣传款",
        }}
      />

      <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 pt-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save variants & specs"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={!dirty || saving}
          className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-ink-300 disabled:opacity-50"
        >
          Cancel
        </button>
        {dirty && !error && !savedFlash && (
          <span className="text-xs font-medium text-clay-600">
            Unsaved changes
          </span>
        )}
        {savedFlash && !dirty && (
          <span className="text-xs text-moss-700">Saved ✓</span>
        )}
        {error && <span className="text-xs text-clay-600">{error}</span>}
      </div>
    </div>
  );
}

// =============================================================================
// Sections
// =============================================================================

function BilingualRowSection({
  title,
  help,
  rows,
  onChange,
  saving,
  placeholders,
}: {
  title: string;
  help?: string;
  rows: BilingualRow[];
  onChange: (rows: BilingualRow[]) => void;
  saving: boolean;
  placeholders?: { en?: string; zh?: string };
}) {
  function setField(idx: number, key: keyof BilingualRow, value: string) {
    const next = [...rows];
    next[idx] = { ...next[idx], [key]: value };
    onChange(next);
  }

  function addRow() {
    onChange([...rows, { en: "", zh: "" }]);
  }

  function removeRow(idx: number) {
    onChange(rows.filter((_, i) => i !== idx));
  }

  function moveRow(idx: number, delta: -1 | 1) {
    const target = idx + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <section>
      <header className="mb-2">
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        {help && <p className="text-xs text-ink-500">{help}</p>}
      </header>
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-100 bg-sand-50 p-3 text-center text-xs text-ink-400">
          No rows yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, idx) => (
            <li
              key={idx}
              className="grid grid-cols-1 items-end gap-3 rounded-xl bg-sand-50/70 p-3 ring-1 ring-ink-100 sm:grid-cols-[1fr_1fr_auto]"
            >
              <LocaleInput
                label="EN"
                value={row.en}
                onChange={(v) => setField(idx, "en", v)}
                placeholder={placeholders?.en}
                disabled={saving}
              />
              <LocaleInput
                label="中文"
                value={row.zh}
                onChange={(v) => setField(idx, "zh", v)}
                placeholder={placeholders?.zh}
                disabled={saving}
              />
              <RowActions
                onMoveUp={() => moveRow(idx, -1)}
                onMoveDown={() => moveRow(idx, 1)}
                onRemove={() => removeRow(idx)}
                isFirst={idx === 0}
                isLast={idx === rows.length - 1}
                disabled={saving}
              />
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={addRow}
        disabled={saving}
        className="mt-2 rounded-md border border-dashed border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-moss-500 hover:text-moss-700 disabled:opacity-50"
      >
        + Add row
      </button>
    </section>
  );
}

function ColorsSection({
  rows,
  onChange,
  saving,
}: {
  rows: ColorRow[];
  onChange: (rows: ColorRow[]) => void;
  saving: boolean;
}) {
  function setField(idx: number, key: keyof ColorRow, value: string) {
    const next = [...rows];
    next[idx] = { ...next[idx], [key]: value };
    onChange(next);
  }

  function addRow() {
    onChange([...rows, { name_en: "", name_zh: "", hex: "" }]);
  }

  function removeRow(idx: number) {
    onChange(rows.filter((_, i) => i !== idx));
  }

  function moveRow(idx: number, delta: -1 | 1) {
    const target = idx + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <section>
      <header className="mb-2">
        <h3 className="text-sm font-semibold text-ink-900">Colors</h3>
        <p className="text-xs text-ink-500">
          Picker swatches on the product detail page. Hex is optional — without
          it the swatch shows a neutral placeholder.
        </p>
      </header>
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-100 bg-sand-50 p-3 text-center text-xs text-ink-400">
          No colors yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, idx) => (
            <li
              key={idx}
              className="grid grid-cols-1 items-end gap-3 rounded-xl bg-sand-50/70 p-3 ring-1 ring-ink-100 sm:grid-cols-[1fr_1fr_8rem_auto]"
            >
              <LocaleInput
                label="EN"
                value={row.name_en}
                onChange={(v) => setField(idx, "name_en", v)}
                placeholder="Natural"
                disabled={saving}
              />
              <LocaleInput
                label="中文"
                value={row.name_zh}
                onChange={(v) => setField(idx, "name_zh", v)}
                placeholder="本色"
                disabled={saving}
              />
              <label className="block text-sm">
                <span className="text-xs font-medium text-ink-500">Hex</span>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="h-7 w-7 rounded-md ring-1 ring-ink-100"
                    style={{
                      backgroundColor: isValidHex(row.hex)
                        ? row.hex
                        : "#D8D4CA",
                    }}
                    aria-hidden
                  />
                  <input
                    type="text"
                    value={row.hex}
                    onChange={(e) => setField(idx, "hex", e.target.value)}
                    disabled={saving}
                    placeholder="#F0E6D2"
                    className="block w-full rounded-lg border-ink-100 bg-white font-mono text-xs uppercase focus:border-moss-500 focus:ring-moss-500"
                  />
                </div>
              </label>
              <RowActions
                onMoveUp={() => moveRow(idx, -1)}
                onMoveDown={() => moveRow(idx, 1)}
                onRemove={() => removeRow(idx)}
                isFirst={idx === 0}
                isLast={idx === rows.length - 1}
                disabled={saving}
              />
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={addRow}
        disabled={saving}
        className="mt-2 rounded-md border border-dashed border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-moss-500 hover:text-moss-700 disabled:opacity-50"
      >
        + Add color
      </button>
    </section>
  );
}

function SpecsSection({
  rows,
  onChange,
  saving,
}: {
  rows: SpecRow[];
  onChange: (rows: SpecRow[]) => void;
  saving: boolean;
}) {
  function setField(idx: number, key: keyof SpecRow, value: string) {
    const next = [...rows];
    next[idx] = { ...next[idx], [key]: value };
    onChange(next);
  }

  function addRow() {
    onChange([
      ...rows,
      { label_en: "", label_zh: "", value_en: "", value_zh: "" },
    ]);
  }

  function removeRow(idx: number) {
    onChange(rows.filter((_, i) => i !== idx));
  }

  function moveRow(idx: number, delta: -1 | 1) {
    const target = idx + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <section>
      <header className="mb-2">
        <h3 className="text-sm font-semibold text-ink-900">
          Specifications
        </h3>
        <p className="text-xs text-ink-500">
          Free-form spec rows shown on the product detail page (e.g. Width,
          Height, Capacity, Weight). Use them for whatever sales typically
          fields questions about.
        </p>
      </header>
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-100 bg-sand-50 p-3 text-center text-xs text-ink-400">
          No specs yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, idx) => (
            <li
              key={idx}
              className="space-y-2 rounded-xl bg-sand-50/70 p-3 ring-1 ring-ink-100"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <LocaleInput
                  label="Label (EN)"
                  value={row.label_en}
                  onChange={(v) => setField(idx, "label_en", v)}
                  placeholder="Material"
                  disabled={saving}
                />
                <LocaleInput
                  label="Label (中文)"
                  value={row.label_zh}
                  onChange={(v) => setField(idx, "label_zh", v)}
                  placeholder="材质"
                  disabled={saving}
                />
                <RowActions
                  onMoveUp={() => moveRow(idx, -1)}
                  onMoveDown={() => moveRow(idx, 1)}
                  onRemove={() => removeRow(idx)}
                  isFirst={idx === 0}
                  isLast={idx === rows.length - 1}
                  disabled={saving}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <LocaleInput
                  label="Value (EN)"
                  value={row.value_en}
                  onChange={(v) => setField(idx, "value_en", v)}
                  placeholder="100% cotton"
                  disabled={saving}
                />
                <LocaleInput
                  label="Value (中文)"
                  value={row.value_zh}
                  onChange={(v) => setField(idx, "value_zh", v)}
                  placeholder="100% 棉"
                  disabled={saving}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={addRow}
        disabled={saving}
        className="mt-2 rounded-md border border-dashed border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-moss-500 hover:text-moss-700 disabled:opacity-50"
      >
        + Add spec
      </button>
    </section>
  );
}

function LocaleInput({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-ink-500">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
      />
    </label>
  );
}

function RowActions({
  onMoveUp,
  onMoveDown,
  onRemove,
  isFirst,
  isLast,
  disabled,
}: {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={isFirst || disabled}
        aria-label="Move up"
        className="rounded-md border border-ink-100 bg-white px-2 py-1 text-xs text-ink-600 hover:border-ink-300 disabled:opacity-30"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={isLast || disabled}
        aria-label="Move down"
        className="rounded-md border border-ink-100 bg-white px-2 py-1 text-xs text-ink-600 hover:border-ink-300 disabled:opacity-30"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="rounded-md border border-ink-100 bg-white px-2.5 py-1 text-xs font-medium text-clay-600 hover:border-clay-500/50 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}

function isValidHex(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^#?[0-9a-fA-F]{3,8}$/.test(trimmed);
}

