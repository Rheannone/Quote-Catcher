import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSessionUser } from "@/lib/supabase-server";

// All 17 default fields, seeded once per new user.
// field_type values must match the DB check constraint — run schema_fields_v2.sql
// to unlock: email, tel, url, date, radio, checkbox_group
const DEFAULT_FIELDS = [
  // ── Contact Information ───────────────────────────────────────────────────
  { field_key: "firstName",        label: "First Name",                        field_type: "text",          required: true,  section: "contact", sort_order: 0,  placeholder: "Jane",                                                 options: null },
  { field_key: "lastName",         label: "Last Name",                         field_type: "text",          required: true,  section: "contact", sort_order: 1,  placeholder: "Smith",                                                options: null },
  { field_key: "company",          label: "Band / Company",                    field_type: "text",          required: false, section: "contact", sort_order: 2,  placeholder: "The Rolling Stones",                                   options: null },
  { field_key: "email",            label: "Email Address",                     field_type: "text",          required: true,  section: "contact", sort_order: 3,  placeholder: "jane@example.com",                                     options: null },
  { field_key: "phone",            label: "Phone",                             field_type: "text",          required: true,  section: "contact", sort_order: 4,  placeholder: "(412) 555-0100",                                       options: null },
  { field_key: "website",          label: "Website",                           field_type: "text",          required: false, section: "contact", sort_order: 5,  placeholder: "https://yourband.com",                                 options: null },
  // ── Project Details ───────────────────────────────────────────────────────
  { field_key: "projectDescription", label: "Project Description",             field_type: "textarea",      required: true,  section: "project", sort_order: 10, placeholder: "Describe your project, event, or order\u2026",         options: null },
  { field_key: "deadline",         label: "Deadline",                          field_type: "text",          required: false, section: "project", sort_order: 11, placeholder: "e.g. May 15, 2026",                                    options: null },
  { field_key: "fulfillment",      label: "Shipping or Local Pick-up",         field_type: "select",        required: true,  section: "project", sort_order: 12, placeholder: null,                                                   options: ["Pick-up", "Shipping"] },
  { field_key: "shippingAddress",  label: "Shipping Address",                  field_type: "textarea",      required: false, section: "project", sort_order: 13, placeholder: "Street, City, State, ZIP, Country",                    options: null },
  // ── Print Specifications ──────────────────────────────────────────────────
  { field_key: "whatPrinting",     label: "What are we printing?",             field_type: "text",          required: true,  section: "print",   sort_order: 20, placeholder: "T-shirts, hoodies, posters, etc.",                     options: null },
  { field_key: "quantity",         label: "How many pieces?",                  field_type: "number",        required: true,  section: "print",   sort_order: 21, placeholder: "50",                                                   options: null },
  { field_key: "printLocations",   label: "Print Locations",                   field_type: "select",        required: true,  section: "print",   sort_order: 22, placeholder: null,                                                   options: ["Front", "Back", "Left Sleeve", "Right Sleeve", "Other"] },
  { field_key: "colors",           label: "Number of Colors",                  field_type: "select",        required: false, section: "print",   sort_order: 23, placeholder: null,                                                   options: ["1 color", "2 colors", "3 colors", "4 colors", "5 colors", "6+ colors"] },
  { field_key: "apparelBrand",     label: "Preferred Apparel Brand",           field_type: "text",          required: true,  section: "print",   sort_order: 24, placeholder: "Gildan, Comfort Colors, Bella+Canvas, No preference\u2026", options: null },
  { field_key: "hasArtwork",       label: "Do you have print-ready artwork?",  field_type: "select",        required: true,  section: "print",   sort_order: 25, placeholder: null,                                                   options: ["Yes", "No", "In Progress"] },
  { field_key: "additionalDetails", label: "Additional Details or Questions",  field_type: "textarea",      required: false, section: "print",   sort_order: 26, placeholder: "Anything else we should know\u2026",                   options: null },
];

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();

  // Only seed if the user has zero fields
  const { count } = await supabase
    .from("custom_fields")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) > 0) {
    return NextResponse.json({ seeded: false, message: "Fields already exist" });
  }

  const rows = DEFAULT_FIELDS.map((f) => ({ ...f, user_id: user.id, active: true }));
  const { error } = await supabase.from("custom_fields").insert(rows);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ seeded: true, count: rows.length });
}
