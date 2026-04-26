"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setStatus("error");
      setErrorMessage(
        "Auth isn't configured in this environment. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(
        error.message === "Invalid login credentials"
          ? "Email or password is incorrect."
          : error.message,
      );
      return;
    }

    // Full-document navigation so the server-rendered admin layout
    // re-runs with the new session cookies (a client-side router push
    // would keep stale RSC payloads from before login).
    window.location.assign(nextPath);
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

      <label className="block text-sm">
        <span className="font-medium text-ink-800">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          minLength={8}
          className="mt-1 block w-full rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
        />
      </label>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-primary w-full"
      >
        {status === "submitting" ? "Signing in…" : "Sign in"}
      </button>

      {status === "error" && errorMessage && (
        <p className="rounded-lg bg-clay-500/10 px-3 py-2 text-sm text-clay-600">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
