import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      company,
      email,
      phone,
      website,
      projectDescription,
      deadline,
      fulfillment,
      shippingCountry,
      shippingAddress1,
      shippingAddress2,
      shippingCity,
      shippingState,
      shippingZip,
      whatPrinting,
      quantity,
      printLocations,
      otherPrintLocation,
      colorsFront,
      colorsBack,
      colorsLeftSleeve,
      colorsRightSleeve,
      apparelBrand,
      hasArtwork,
      additionalDetails,
    } = body;

    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("quotes").insert([
      {
        first_name: firstName,
        last_name: lastName,
        company,
        email,
        phone,
        website,
        project_description: projectDescription,
        deadline: deadline || null,
        fulfillment,
        shipping_country: shippingCountry,
        shipping_address1: shippingAddress1,
        shipping_address2: shippingAddress2,
        shipping_city: shippingCity,
        shipping_state: shippingState,
        shipping_zip: shippingZip,
        what_printing: whatPrinting,
        quantity: Number(quantity),
        print_locations: printLocations,
        other_print_location: otherPrintLocation,
        colors_front: colorsFront,
        colors_back: colorsBack,
        colors_left_sleeve: colorsLeftSleeve,
        colors_right_sleeve: colorsRightSleeve,
        apparel_brand: apparelBrand,
        has_artwork: hasArtwork,
        additional_details: additionalDetails,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
