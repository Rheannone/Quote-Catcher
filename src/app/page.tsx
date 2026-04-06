import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = getSupabaseAdmin();

  // Find the first admin who has set up their form and redirect to it.
  // For a single-business setup this is transparent; for multi-tenant
  // each business owner shares their /form/[userId] link.
  const { data } = await supabase
    .from("custom_fields")
    .select("user_id")
    .eq("active", true)
    .not("user_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (data?.user_id) {
    redirect(`/form/${data.user_id}`);
  }

  // No form set up yet
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-3 max-w-sm">
        <p className="text-5xl">🖨️</p>
        <h1 className="text-2xl font-black uppercase tracking-widest text-brand">
          Setting Up
        </h1>
        <p className="text-gray-500 text-sm">
          The quote form is being configured. Check back soon!
        </p>
      </div>
    </div>
  );
}
