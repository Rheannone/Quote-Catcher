import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSessionUser } from "@/lib/supabase-server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const ownerId = process.env.ADMIN_USER_ID!;

  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("user_id", ownerId)
    .maybeSingle();

  return NextResponse.json(data ?? {});
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const ownerId = process.env.ADMIN_USER_ID!;
  const body = await req.json();

  const patch: Record<string, string | null> = {};
  if (body.brand_color !== undefined)        patch.brand_color = body.brand_color;
  if (body.accent_color !== undefined)       patch.accent_color = body.accent_color;
  if (body.font_family !== undefined)        patch.font_family = body.font_family;
  if (body.logo_url !== undefined)           patch.logo_url = body.logo_url;
  if (body.business_name !== undefined)      patch.business_name = body.business_name;
  if (body.instagram_url !== undefined)      patch.instagram_url = body.instagram_url;
  if (body.contact_email !== undefined)      patch.contact_email = body.contact_email;
  if (body.contact_phone !== undefined)      patch.contact_phone = body.contact_phone;
  if (body.form_headline !== undefined)      patch.form_headline = body.form_headline;
  if (body.form_subtitle_html !== undefined) patch.form_subtitle_html = body.form_subtitle_html;
  if (body.header_style !== undefined)       patch.header_style = body.header_style;
  if (body.header_bg_color !== undefined)    patch.header_bg_color = body.header_bg_color;

  const { data: existing } = await supabase
    .from("site_settings")
    .select("id")
    .eq("user_id", ownerId)
    .maybeSingle();

  let error;
  if (existing?.id) {
    ({ error } = await supabase
      .from("site_settings")
      .update(patch)
      .eq("id", existing.id));
  } else {
    ({ error } = await supabase
      .from("site_settings")
      .insert({ ...patch, user_id: ownerId }));
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
