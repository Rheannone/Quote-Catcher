import { getSupabaseAdmin } from "@/lib/supabase";

// Always render at request time (requires Supabase at runtime, not build time)
export const dynamic = "force-dynamic";

type Quote = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string;
  project_description: string;
  deadline: string | null;
  fulfillment: string;
  what_printing: string;
  quantity: number;
  print_locations: string[];
  colors_front: string;
  colors_back: string;
  colors_left_sleeve: string;
  colors_right_sleeve: string;
  apparel_brand: string;
  has_artwork: string;
  additional_details: string;
};

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-block bg-brand/10 text-brand text-xs font-semibold px-2 py-0.5 rounded-full">
      {text}
    </span>
  );
}

export default async function AdminPage() {
  const supabase = getSupabaseAdmin();
  const { data: quotes, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-red-600">
        Error loading quotes: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black uppercase tracking-widest text-brand mb-6">
        Quote Submissions ({quotes?.length ?? 0})
      </h1>

      {!quotes || quotes.length === 0 ? (
        <p className="text-gray-400">No submissions yet.</p>
      ) : (
        <div className="space-y-6">
          {(quotes as Quote[]).map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <span className="font-bold text-lg text-brand">
                    {q.first_name} {q.last_name}
                  </span>
                  {q.company && (
                    <span className="text-gray-400 text-sm ml-2">
                      — {q.company}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(q.created_at).toLocaleString()}
                </span>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
                <Info label="Email" value={q.email} />
                <Info label="Phone" value={q.phone} />
                <Info label="Fulfillment" value={q.fulfillment} />
                {q.deadline && <Info label="Deadline" value={q.deadline} />}
              </div>

              {/* Project */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                  Project Description
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {q.project_description}
                </p>
              </div>

              {/* Print */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
                <Info label="Printing" value={q.what_printing} />
                <Info label="Quantity" value={String(q.quantity)} />
                <Info label="Apparel Brand" value={q.apparel_brand} />
                <Info label="Has Artwork" value={q.has_artwork} />
              </div>

              {/* Locations */}
              {q.print_locations?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                    Print Locations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {q.print_locations.map((loc: string) => (
                      <Badge key={loc} text={loc} />
                    ))}
                  </div>
                </div>
              )}

              {/* Color counts */}
              <div className="flex flex-wrap gap-4 text-sm mb-4">
                {q.colors_front && (
                  <Info label="Front Colors" value={q.colors_front} />
                )}
                {q.colors_back && (
                  <Info label="Back Colors" value={q.colors_back} />
                )}
                {q.colors_left_sleeve && (
                  <Info label="L.Sleeve Colors" value={q.colors_left_sleeve} />
                )}
                {q.colors_right_sleeve && (
                  <Info label="R.Sleeve Colors" value={q.colors_right_sleeve} />
                )}
              </div>

              {q.additional_details && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                    Additional Notes
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {q.additional_details}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase">{label}</p>
      <p className="text-gray-800 font-medium">{value || "—"}</p>
    </div>
  );
}
