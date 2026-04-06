import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSessionUser } from "@/lib/supabase-server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const body = await req.json();

  const { error } = await supabase
    .from("custom_fields")
    .update({
      label: body.label,
      field_type: body.field_type,
      required: body.required,
      options: body.options ?? null,
      active: body.active ?? true,
      sort_order: body.sort_order,
      section: body.section ?? "additional",
      placeholder: body.placeholder ?? null,
    })
    .eq("id", params.id)
    .eq("user_id", user.id); // ensure ownership

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("custom_fields")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id); // ensure ownership

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
