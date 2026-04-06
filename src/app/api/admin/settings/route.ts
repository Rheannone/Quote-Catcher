import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSessionUser } from "@/lib/supabase-server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json(data ?? {});
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const body = await req.json();

  const patch: Record<string, string | null> = {};
  if (body.brand_color !== undefined) patch.brand_color = body.brand_color;
  if (body.accent_color !== undefined) patch.accent_color = body.accent_color;
  if (body.font_family !== undefined) patch.font_family = body.font_family;
  if (body.logo_url !== undefined) patch.logo_url = body.logo_url;

  const { error } = await supabase
    .from("site_settings")
    .upsert({ ...patch, user_id: user.id }, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
