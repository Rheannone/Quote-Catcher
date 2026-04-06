import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "png";
  const filename = `logo-${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { data, error } = await supabase.storage
    .from("logos")
    .upload(filename, Buffer.from(bytes), {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("logos").getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl });
}
