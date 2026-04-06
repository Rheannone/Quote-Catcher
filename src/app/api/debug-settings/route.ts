import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data: byUserId, error: e1 } = await supabase
    .from("site_settings")
    .select("*")
    .eq("user_id", "fff57028-4837-4e2c-ba17-e33f7eeb07b6")
    .maybeSingle();

  const { data: all, error: e2 } = await supabase
    .from("site_settings")
    .select("*");

  return NextResponse.json({
    env_url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "MISSING",
    env_key_present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    byUserId,
    byUserId_error: e1?.message ?? null,
    all,
    all_error: e2?.message ?? null,
  });
}
