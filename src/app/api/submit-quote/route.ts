import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabaseAdmin();

    // ── New dynamic form format ───────────────────────────────────────────────
    if (body.fieldData !== undefined) {
      const { fieldData, formOwnerId } = body as {
        fieldData: Record<string, unknown>;
        formOwnerId: string;
      };

      // Best-effort: find email value anywhere in fieldData (key might vary)
      const emailValue =
        (fieldData.email as string) ??
        (fieldData.emailAddress as string) ??
        Object.values(fieldData).find(
          (v) => typeof v === "string" && v.includes("@")
        ) as string | undefined ??
        null;

      const { error } = await supabase.from("quotes").insert([
        {
          // Populate named columns for backwards compat / admin view
          first_name:          (fieldData.firstName    as string) ?? null,
          last_name:           (fieldData.lastName     as string) ?? null,
          company:             (fieldData.company      as string) ?? null,
          email:               emailValue,
          phone:               (fieldData.phone        as string) ?? null,
          website:             (fieldData.website      as string) ?? null,
          project_description: (fieldData.projectDescription as string) ?? null,
          deadline:            (fieldData.deadline as string)     || null,
          fulfillment:         (fieldData.fulfillment  as string) ?? null,
          what_printing:       (fieldData.whatPrinting as string) ?? null,
          quantity:            fieldData.quantity ? Number(fieldData.quantity) : null,
          print_locations:     Array.isArray(fieldData.printLocations)
                                 ? fieldData.printLocations
                                 : fieldData.printLocations ? [fieldData.printLocations] : null,
          apparel_brand:       (fieldData.apparelBrand     as string) ?? null,
          has_artwork:         (fieldData.hasArtwork       as string) ?? null,
          additional_details:  (fieldData.additionalDetails as string) ?? null,
          // Full blob + owner
          custom_fields_data:  fieldData,
          owner_user_id:       formOwnerId ?? null,
        },
      ]);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // ── Legacy hardcoded format (kept for backwards compat) ───────────────────
    const {
      firstName, lastName, company, email, phone, website,
      projectDescription, deadline, fulfillment,
      shippingCountry, shippingAddress1, shippingAddress2,
      shippingCity, shippingState, shippingZip,
      whatPrinting, quantity, printLocations, otherPrintLocation,
      colorsFront, colorsBack, colorsLeftSleeve, colorsRightSleeve,
      apparelBrand, hasArtwork, additionalDetails, custom,
    } = body;

    const { error } = await supabase.from("quotes").insert([
      {
        first_name: firstName, last_name: lastName, company, email, phone, website,
        project_description: projectDescription, deadline: deadline || null, fulfillment,
        shipping_country: shippingCountry, shipping_address1: shippingAddress1,
        shipping_address2: shippingAddress2, shipping_city: shippingCity,
        shipping_state: shippingState, shipping_zip: shippingZip,
        what_printing: whatPrinting, quantity: Number(quantity),
        print_locations: printLocations, other_print_location: otherPrintLocation,
        colors_front: colorsFront, colors_back: colorsBack,
        colors_left_sleeve: colorsLeftSleeve, colors_right_sleeve: colorsRightSleeve,
        apparel_brand: apparelBrand, has_artwork: hasArtwork,
        additional_details: additionalDetails, custom_fields_data: custom ?? null,
      },
    ]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
