import QuoteForm from "@/components/QuoteForm";
import type { CustomField } from "@/components/QuoteForm";
import { createSupabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
    </svg>
  );
}

export default async function QuotePage() {
  const userId = process.env.ADMIN_USER_ID!;
  const supabase = createSupabaseAdmin();

  // Fetch active fields
  const { data: fields, error } = await supabase
    .from("custom_fields")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("section")
    .order("sort_order");

  if (error) {
    notFound();
  }

  // Fetch brand settings — try user-scoped first, fall back to any row (legacy)
  let { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!settings) {
    const { data: fallback } = await supabase
      .from("site_settings")
      .select("*")
      .maybeSingle();
    settings = fallback;
  }

  const s = settings as Record<string, unknown> | null;

  const brandColor   = s?.brand_color   as string ?? "#1a1a2e";
  const accentColor  = s?.accent_color  as string ?? "#e63946";
  const fontFamily   = s?.font_family   as string ?? "Inter";
  const logoUrl      = s?.logo_url      as string | null ?? null;
  const businessName = s?.business_name as string ?? "Latziyela Prints";
  const instagramUrl = s?.instagram_url as string ?? "";
  const contactEmail = s?.contact_email as string ?? "";
  const contactPhone = s?.contact_phone as string ?? "";

  // Extract Instagram handle for display
  const igHandle = instagramUrl
    ? instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "")
    : null;

  const hasContact = igHandle || contactEmail || contactPhone;

  const cssVars = {
    "--brand-color":  brandColor,
    "--brand-accent": accentColor,
  } as React.CSSProperties;

  return (
    <div
      style={{ ...cssVars, fontFamily: "'Inter', -apple-system, sans-serif" }}
      className="min-h-screen flex flex-col"
    >
      {/* Branded header */}
      <header className="bg-brand text-white py-5 px-6 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-9 object-contain rounded" />
          ) : (
            <span
              className="font-black text-xl tracking-widest uppercase"
              style={{ fontFamily: `'${fontFamily}', sans-serif` }}
            >
              {businessName}
            </span>
          )}
        </div>
      </header>

      {/* Form body */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="mb-8 text-center">
            <h1
              className="text-3xl font-black uppercase tracking-widest text-brand mb-2"
              style={{ fontFamily: `'${fontFamily}', sans-serif` }}
            >
              Request a Quote
            </h1>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Fill out the form below and we&apos;ll get back to you within 1–3 business days.
            </p>
          </div>

          {/* Contact / social card */}
          {hasContact && (
            <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-5 items-center justify-center">
              {igHandle && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-brand-accent hover:underline transition"
                >
                  <InstagramIcon />
                  @{igHandle}
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-accent transition"
                >
                  <MailIcon />
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-accent transition"
                >
                  <PhoneIcon />
                  {contactPhone}
                </a>
              )}
            </div>
          )}

          {fields && fields.length > 0 ? (
            <QuoteForm fields={fields as CustomField[]} formOwnerId={userId} />
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <p className="text-4xl mb-3">🛠️</p>
              <h2 className="font-bold text-gray-700">Form being configured</h2>
              <p className="text-sm text-gray-400 mt-2">
                This form isn&apos;t ready yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Branded footer */}
      <footer className="bg-brand text-white text-center text-xs py-4 mt-10">
        &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
      </footer>
    </div>
  );
}
