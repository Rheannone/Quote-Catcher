import { createSupabaseAdmin } from "@/lib/supabase";
import { getSessionUser } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Quote = {
  id: string;
  created_at: string;
  custom_fields_data: Record<string, unknown> | null;
  // Legacy named columns (populated by old form submissions)
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  fulfillment: string | null;
  what_printing: string | null;
  quantity: number | null;
  project_description: string | null;
};

type FieldDef = {
  id: string;
  field_key: string | null;
  label: string;
};

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 font-medium mt-0.5">{value || "—"}</p>
    </div>
  );
}

function QuoteCard({
  quote,
  labelMap,
}: {
  quote: Quote;
  labelMap: Record<string, string>;
}) {
  const data = quote.custom_fields_data;
  const isDynamic = data && Object.keys(data).length > 0;

  // Build a display label for a raw key
  const getLabel = (key: string) => labelMap[key] ?? key;

  // Title: prefer from dynamic data, fall back to legacy columns
  const firstName = isDynamic
    ? String(data.firstName ?? data.first_name ?? quote.first_name ?? "")
    : (quote.first_name ?? "");
  const lastName = isDynamic
    ? String(data.lastName ?? data.last_name ?? quote.last_name ?? "")
    : (quote.last_name ?? "");
  const email = isDynamic
    ? String(data.email ?? quote.email ?? "")
    : (quote.email ?? "");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-5">
        <div>
          <span className="font-bold text-lg text-brand">
            {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Anonymous"}
          </span>
          {email && (
            <a href={`mailto:${email}`} className="block text-sm text-gray-400 hover:text-brand-accent mt-0.5">
              {email}
            </a>
          )}
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          {new Date(quote.created_at).toLocaleString()}
        </span>
      </div>

      {isDynamic ? (
        // ── New dynamic format ──────────────────────────────────────────────
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Object.entries(data).map(([key, val]) => {
            if (val === null || val === undefined || val === "") return null;
            const display = Array.isArray(val) ? val.join(", ") : String(val);
            return <Info key={key} label={getLabel(key)} value={display} />;
          })}
        </div>
      ) : (
        // ── Legacy format ───────────────────────────────────────────────────
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {quote.phone && <Info label="Phone" value={quote.phone} />}
            {quote.fulfillment && <Info label="Fulfillment" value={quote.fulfillment} />}
            {quote.what_printing && <Info label="Printing" value={quote.what_printing} />}
            {quote.quantity != null && <Info label="Quantity" value={String(quote.quantity)} />}
          </div>
          {quote.project_description && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Project</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.project_description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default async function AdminPage() {
  const [user, supabase] = await Promise.all([
    getSessionUser(),
    Promise.resolve(createSupabaseAdmin()),
  ]);

  // Fetch this user's field definitions to build a label map
  const labelMap: Record<string, string> = {};
  if (user) {
    const { data: fieldDefs } = await supabase
      .from("custom_fields")
      .select("id, field_key, label")
      .eq("user_id", user.id);

    for (const f of (fieldDefs ?? []) as FieldDef[]) {
      labelMap[f.id] = f.label;
      if (f.field_key) labelMap[f.field_key] = f.label;
    }
  }

  // Fetch quotes — scoped to this user if they have any, otherwise all
  const query = supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (user) query.or(`owner_user_id.eq.${user.id},owner_user_id.is.null`);

  const { data: quotes, error } = await query;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-red-600">
        Error loading quotes: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black uppercase tracking-widest text-brand mb-6">
        Quote Submissions ({quotes?.length ?? 0})
      </h1>

      {!quotes || quotes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">📬</p>
          <p className="font-semibold text-gray-500">No submissions yet</p>
          <p className="text-sm mt-1">Share your form link and submissions will appear here</p>
        </div>
      ) : (
        <div className="space-y-5">
          {(quotes as Quote[]).map((q) => (
            <QuoteCard key={q.id} quote={q} labelMap={labelMap} />
          ))}
        </div>
      )}
    </div>
  );
}
