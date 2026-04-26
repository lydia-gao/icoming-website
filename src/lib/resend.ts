import { Resend } from "resend";

/**
 * Server-only Resend client. Returns `null` if `RESEND_API_KEY` is unset,
 * so local dev continues to work without an account (inquiry submissions
 * will log instead of sending an email).
 */
let cachedResend: Resend | null | undefined;

export function getResend(): Resend | null {
  if (cachedResend !== undefined) return cachedResend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    cachedResend = null;
    return null;
  }
  cachedResend = new Resend(key);
  return cachedResend;
}

/**
 * Parse the `INQUIRY_TO_EMAIL` env var (comma-separated list of addresses).
 * Defaults to the single production sales address.
 */
export function getInquiryRecipients(): string[] {
  const raw = process.env.INQUIRY_TO_EMAIL ?? "sale2@i-coming.com";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * From-address used for inquiry notifications. On V1 this is Resend's
 * default sender; when a real domain is verified, set RESEND_FROM_EMAIL.
 */
export function getInquiryFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "ICOM BAG RFQ <onboarding@resend.dev>";
}
