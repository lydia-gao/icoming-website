import { NextResponse } from "next/server";

type InquiryItemPayload = {
  slug: string;
  name: string;
  note?: string;
};

type InquiryPayload = {
  name?: string;
  company?: string;
  email?: string;
  country?: string;
  whatsapp?: string;
  channel?: string;
  message?: string;
  items?: InquiryItemPayload[];
};

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /.+@.+\..+/.test(value);
}

export async function POST(request: Request) {
  let body: InquiryPayload;
  try {
    body = (await request.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!isValidEmail(body.email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  // V1: log the inquiry server-side so it shows in Vercel logs.
  // Swap this for Resend / SMTP / Formspree by adding a provider call here;
  // the INQUIRY_TO_EMAIL env var is reserved for that routing.
  const to = process.env.INQUIRY_TO_EMAIL ?? "sale1@i-coming.com";
  console.info("[inquiry] new submission", {
    to,
    from: body.email,
    name: body.name,
    company: body.company,
    country: body.country,
    whatsapp: body.whatsapp,
    channel: body.channel,
    items: body.items?.map((i) => ({ slug: i.slug, note: i.note })) ?? [],
    message: body.message,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
