import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await req.json();

  const patch: Record<string, string | null> = { id: "1" } as never;
  if (body.brand_color !== undefined) patch.brand_color = body.brand_color;
  if (body.accent_color !== undefined) patch.accent_color = body.accent_color;
  if (body.font_family !== undefined) patch.font_family = body.font_family;
  if (body.logo_url !== undefined) patch.logo_url = body.logo_url;

  const { error } = await supabase
    .from("site_settings")
    .upsert({ ...patch, id: 1 });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
