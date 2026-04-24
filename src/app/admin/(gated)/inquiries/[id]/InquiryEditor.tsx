"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS: Array<{ value: Status; label: string }> = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "quoted", label: "Quoted" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

type Status = "new" | "in_progress" | "quoted" | "won" | "lost";

type AdminOption = {
  id: string;
  email: string;
  label: string;
};

export function InquiryEditor({
  inquiryId,
  initialStatus,
  initialAssignedEmail,
  initialNotes,
  admins,
}: {
  inquiryId: string;
  initialStatus: Status;
  initialAssignedEmail: string | null;
  initialNotes: string;
  admins: AdminOption[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [assignedEmail, setAssignedEmail] = useState<string>(
    initialAssignedEmail ?? "",
  );
  const [notes, setNotes] = useState<string>(initialNotes);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dirty =
    status !== initialStatus ||
    (assignedEmail || null) !== (initialAssignedEmail || null) ||
    notes.trim() !== (initialNotes ?? "").trim();

  async function handleSave() {
    setSaveState("saving");
    setErrorMessage(null);

    const assignedId = admins.find((a) => a.email === assignedEmail)?.id ?? null;

    try {
      const res = await fetch(`/api/admin/inquiry/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          assigned_to: assignedId,
          internal_notes: notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Save failed");
      }
      setSaveState("saved");
      router.refresh();
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setErrorMessage(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-ink-100">
      <h2 className="font-serif text-lg font-semibold">Manage</h2>

      <label className="block text-sm">
        <span className="font-medium text-ink-800">Status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="font-medium text-ink-800">Assigned to</span>
        <select
          value={assignedEmail}
          onChange={(e) => setAssignedEmail(e.target.value)}
          className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
        >
          <option value="">— Unassigned —</option>
          {admins.map((a) => (
            <option key={a.id} value={a.email}>
              {a.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="font-medium text-ink-800">Internal notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          placeholder="Only visible to admins. Anything helpful for follow-up."
          className="mt-1 block w-full rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
        />
      </label>

      <div className="flex items-center gap-3">
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
        {saveState === "error" && errorMessage && (
          <span className="text-xs text-clay-600">{errorMessage}</span>
        )}
      </div>
    </div>
  );
}
