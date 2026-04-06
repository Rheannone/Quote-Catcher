import QuoteForm from "@/components/QuoteForm";
import type { CustomField } from "@/components/QuoteForm";
import { getSupabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UserFormPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = params;
  const supabase = getSupabaseAdmin();

  // Fetch this user's active fields
  const { data: fields, error } = await supabase
    .from("custom_fields")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("section")
    .order("sort_order");

  if (error || !fields || fields.length === 0) {
    notFound();
  }

  // Fetch this user's brand settings
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const brandColor  = settings?.brand_color  ?? "#1a1a2e";
  const accentColor = settings?.accent_color ?? "#e63946";
  const fontFamily  = settings?.font_family  ?? "Inter";
  const logoUrl     = settings?.logo_url     ?? null;

  const cssVars = {
    "--brand-color":  brandColor,
    "--brand-accent": accentColor,
  } as React.CSSProperties;

  return (
    <div style={cssVars}>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-14 mx-auto mb-4 object-contain" />
          )}
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
        <QuoteForm fields={fields as CustomField[]} formOwnerId={userId} />
      </div>
    </div>
  );
}
