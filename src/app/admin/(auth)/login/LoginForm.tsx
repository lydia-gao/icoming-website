"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setStatus("error");
      setErrorMessage(
        "Auth isn't configured in this environment. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      );
      return;
    }

    const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: redirect,
        // Only allowlisted users can sign in — prevent rogue sign-ups.
        shouldCreateUser: true,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      <label className="block text-sm">
        <span className="font-medium text-ink-800">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          inputMode="email"
          placeholder="sales@i-coming.com"
          className="mt-1 block w-full rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
        />
      </label>

      <button
        type="submit"
        disabled={status === "sending" || status === "sent"}
        className="btn-primary w-full"
      >
        {status === "sending"
          ? "Sending…"
          : status === "sent"
          ? "Link sent — check your inbox"
          : "Send sign-in link"}
      </button>

      {status === "error" && errorMessage && (
        <p className="rounded-lg bg-clay-500/10 px-3 py-2 text-sm text-clay-600">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
