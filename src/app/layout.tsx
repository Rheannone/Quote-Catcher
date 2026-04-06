import type { Metadata } from "next";
import "./globals.css";
import { createSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "QuoteCatcher",
  description: "A custom quote form builder for small businesses.",
};

const FONT_WEIGHTS: Record<string, string> = {
  Inter: "300;400;600;700;900",
  Montserrat: "400;600;700;900",
  Oswald: "400;500;600;700",
  Raleway: "400;600;700;800",
  Roboto: "400;500;700;900",
  "Playfair Display": "400;700;900",
  "Bebas Neue": "400",
  Poppins: "400;600;700;800;900",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseAdmin();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .maybeSingle();

  const brandColor = settings?.brand_color ?? "#1a1a2e";
  const accentColor = settings?.accent_color ?? "#e94560";
  const fontFamily = settings?.font_family ?? "Inter";
  const logoUrl: string | null = settings?.logo_url ?? null;

  const weights = FONT_WEIGHTS[fontFamily] ?? "400;600;700;900";
  const fontHref = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    fontFamily
  )}:wght@${weights}&display=swap`;

  const cssVars = {
    "--brand-color": brandColor,
    "--brand-accent": accentColor,
  } as React.CSSProperties;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={fontHref} rel="stylesheet" />
      </head>
      <body
        className="min-h-screen flex flex-col bg-gray-50 text-gray-900"
        style={{ ...cssVars, fontFamily: `'${fontFamily}', sans-serif` }}
      >
        {children}
      </body>
    </html>
  );
}
