"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FieldSpec, SectionSchema } from "@/lib/cms-schemas";
import type {
  BilingualPair,
  EditorFieldValue,
} from "@/lib/cms-defaults";

type Props = {
  schema: SectionSchema;
  initialValues: Record<string, EditorFieldValue>;
  initialIsCustomized: boolean;
  initialUpdatedAt: string | null;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export function SectionEditor({
  schema,
  initialValues,
  initialIsCustomized,
  initialUpdatedAt,
}: Props) {
  const router = useRouter();
  const [values, setValues] =
    useState<Record<string, EditorFieldValue>>(initialValues);
  const [baseline, setBaseline] =
    useState<Record<string, EditorFieldValue>>(initialValues);
  const [isCustomized, setIsCustomized] = useState(initialIsCustomized);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dirty = useMemo(() => !valuesEqual(values, baseline), [values, baseline]);

  function setText(fieldKey: string, locale: "en" | "zh", v: string) {
    setValues((prev) => {
      const current = prev[fieldKey];
      if (!current || current.type !== "text") return prev;
      return {
        ...prev,
        [fieldKey]: {
          type: "text",
          value: { ...current.value, [locale]: v },
        },
      };
    });
  }

  function setParagraph(
    fieldKey: string,
    index: number,
    locale: "en" | "zh",
    v: string,
  ) {
    setValues((prev) => {
      const current = prev[fieldKey];
      if (!current || current.type !== "paragraphs") return prev;
      const next = current.value.map((p, i) =>
        i === index ? { ...p, [locale]: v } : p,
      );
      return { ...prev, [fieldKey]: { type: "paragraphs", value: next } };
    });
  }

  function addParagraph(fieldKey: string) {
    setValues((prev) => {
      const current = prev[fieldKey];
      if (!current || current.type !== "paragraphs") return prev;
      return {
        ...prev,
        [fieldKey]: {
          type: "paragraphs",
          value: [...current.value, { en: "", zh: "" }],
        },
      };
    });
  }

  function removeParagraph(fieldKey: string, index: number) {
    setValues((prev) => {
      const current = prev[fieldKey];
      if (!current || current.type !== "paragraphs") return prev;
      return {
        ...prev,
        [fieldKey]: {
          type: "paragraphs",
          value: current.value.filter((_, i) => i !== index),
        },
      };
    });
  }

  async function handleSave() {
    setSaveState("saving");
    setErrorMessage(null);
    try {
      const payload: Record<string, unknown> = {};
      for (const field of schema.fields) {
        const v = values[field.key];
        if (!v) continue;
        if (v.type === "text") {
          payload[field.key] = { en: v.value.en, zh: v.value.zh };
        } else {
          payload[field.key] = v.value.map((p) => ({ en: p.en, zh: p.zh }));
        }
      }

      const res = await fetch(
        `/api/admin/cms/sections/${encodeURIComponent(schema.key)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: payload }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Save failed");
      }
      const result = (await res.json()) as { status?: string };
      setBaseline(values);
      setIsCustomized(result.status !== "default");
      setUpdatedAt(new Date().toISOString());
      setSaveState("saved");
      router.refresh();
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setErrorMessage(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function handleReset() {
    if (
      !window.confirm(
        "Reset this section to the default text and images? Any changes you've saved will be removed.",
      )
    ) {
      return;
    }
    setSaveState("saving");
    setErrorMessage(null);
    try {
      const res = await fetch(
        `/api/admin/cms/sections/${encodeURIComponent(schema.key)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Reset failed");
      }
      setSaveState("saved");
      router.refresh();
      setTimeout(() => setSaveState("idle"), 1500);
    } catch (err) {
      setSaveState("error");
      setErrorMessage(err instanceof Error ? err.message : "Reset failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill customized={isCustomized} updatedAt={updatedAt} />
        {dirty && (
          <span className="text-xs font-medium text-clay-600">
            Unsaved changes
          </span>
        )}
      </div>

      <div className="space-y-8">
        {schema.fields.map((field) => (
          <FieldRow
            key={field.key}
            field={field}
            value={values[field.key]}
            onSetText={setText}
            onSetParagraph={setParagraph}
            onAddParagraph={addParagraph}
            onRemoveParagraph={removeParagraph}
          />
        ))}
      </div>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-ink-100 bg-sand-50/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saveState === "saving"}
          className="btn-primary"
        >
          {saveState === "saving"
            ? "Saving…"
            : saveState === "saved"
            ? "Saved ✓"
            : "Save changes"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={!isCustomized || saveState === "saving"}
          className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-sm font-semibold text-ink-700 hover:border-clay-500/50 hover:text-clay-700 disabled:opacity-40"
        >
          Reset to default
        </button>
        {saveState === "error" && errorMessage && (
          <span className="text-xs text-clay-600">{errorMessage}</span>
        )}
      </div>
    </div>
  );
}

function FieldRow({
  field,
  value,
  onSetText,
  onSetParagraph,
  onAddParagraph,
  onRemoveParagraph,
}: {
  field: FieldSpec;
  value: EditorFieldValue | undefined;
  onSetText: (fieldKey: string, locale: "en" | "zh", v: string) => void;
  onSetParagraph: (
    fieldKey: string,
    index: number,
    locale: "en" | "zh",
    v: string,
  ) => void;
  onAddParagraph: (fieldKey: string) => void;
  onRemoveParagraph: (fieldKey: string, index: number) => void;
}) {
  if (!value) return null;

  if (value.type === "paragraphs") {
    const canRemove = value.value.length > (field.paragraphMin ?? 1);
    const canAdd = value.value.length < (field.paragraphMax ?? 5);
    return (
      <fieldset className="space-y-3">
        <legend className="font-semibold text-ink-900">{field.label}</legend>
        {field.help && <p className="text-xs text-ink-500">{field.help}</p>}
        <div className="space-y-4">
          {value.value.map((pair, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white p-4 ring-1 ring-ink-100"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Paragraph {idx + 1}
                </span>
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => onRemoveParagraph(field.key, idx)}
                    className="text-xs font-medium text-clay-600 hover:text-clay-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              <BilingualInput
                en={pair.en}
                zh={pair.zh}
                multiline
                softMax={field.softMax}
                onChange={(loc, v) => onSetParagraph(field.key, idx, loc, v)}
              />
            </div>
          ))}
          {canAdd && (
            <button
              type="button"
              onClick={() => onAddParagraph(field.key)}
              className="rounded-md border border-dashed border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 hover:border-moss-500 hover:text-moss-700"
            >
              + Add paragraph
            </button>
          )}
        </div>
      </fieldset>
    );
  }

  // text / textarea
  return (
    <fieldset className="space-y-2">
      <legend className="font-semibold text-ink-900">{field.label}</legend>
      {field.help && <p className="text-xs text-ink-500">{field.help}</p>}
      <BilingualInput
        en={value.value.en}
        zh={value.value.zh}
        multiline={field.type === "textarea"}
        softMax={field.softMax}
        onChange={(loc, v) => onSetText(field.key, loc, v)}
      />
    </fieldset>
  );
}

function BilingualInput({
  en,
  zh,
  multiline,
  softMax,
  onChange,
}: {
  en: string;
  zh: string;
  multiline?: boolean;
  softMax?: number;
  onChange: (locale: "en" | "zh", value: string) => void;
}) {
  const enHas = en.trim().length > 0;
  const zhHas = zh.trim().length > 0;
  const onlyOneFilled = (enHas && !zhHas) || (zhHas && !enHas);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <LocaleField
        label="English"
        value={en}
        onChange={(v) => onChange("en", v)}
        multiline={multiline}
        softMax={softMax}
        warn={onlyOneFilled && !enHas}
      />
      <LocaleField
        label="中文"
        value={zh}
        onChange={(v) => onChange("zh", v)}
        multiline={multiline}
        softMax={softMax}
        warn={onlyOneFilled && !zhHas}
      />
    </div>
  );
}

function LocaleField({
  label,
  value,
  onChange,
  multiline,
  softMax,
  warn,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  softMax?: number;
  warn?: boolean;
}) {
  const len = value.length;
  const overSoft = softMax != null && len > softMax;
  return (
    <label className="block text-sm">
      <span className="font-medium text-ink-700">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
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
      <div className="mt-1 flex items-center justify-between text-xs">
        {warn ? (
          <span className="text-clay-600">Missing — falls back to default.</span>
        ) : (
          <span />
        )}
        {softMax != null && (
          <span className={overSoft ? "text-clay-600" : "text-ink-400"}>
            {len}
            {softMax != null ? ` / ${softMax}` : ""}
          </span>
        )}
      </div>
    </label>
  );
}

function StatusPill({
  customized,
  updatedAt,
}: {
  customized: boolean;
  updatedAt: string | null;
}) {
  if (!customized) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-600 ring-1 ring-inset ring-ink-100">
        <span className="h-1.5 w-1.5 rounded-full bg-ink-400" />
        Currently using default
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-moss-100 px-3 py-1 text-xs font-medium text-moss-800 ring-1 ring-inset ring-moss-200">
      <span className="h-1.5 w-1.5 rounded-full bg-moss-700" />
      Customized
      {updatedAt ? ` · ${formatTimestamp(updatedAt)}` : null}
    </span>
  );
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Deep-equal comparison for editor field-value records.
function valuesEqual(
  a: Record<string, EditorFieldValue>,
  b: Record<string, EditorFieldValue>,
): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    const av = a[key];
    const bv = b[key];
    if (!av || !bv || av.type !== bv.type) return false;
    if (av.type === "text" && bv.type === "text") {
      if (av.value.en !== bv.value.en || av.value.zh !== bv.value.zh) {
        return false;
      }
    } else if (av.type === "paragraphs" && bv.type === "paragraphs") {
      if (!paragraphsEqual(av.value, bv.value)) return false;
    }
  }
  return true;
}

function paragraphsEqual(a: BilingualPair[], b: BilingualPair[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].en !== b[i].en || a[i].zh !== b[i].zh) return false;
  }
  return true;
}
