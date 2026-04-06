"use client";

import { useState, useEffect, useRef } from "react";

const FONT_OPTIONS = [
  "Inter",
  "Montserrat",
  "Oswald",
  "Raleway",
  "Roboto",
  "Playfair Display",
  "Bebas Neue",
  "Poppins",
] as const;

export default function SettingsPage() {
  const [brandColor, setBrandColor] = useState("#1a1a2e");
  const [accentColor, setAccentColor] = useState("#e94560");
  const [fontFamily, setFontFamily] = useState<string>("Inter");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Load all preview fonts once on mount
  useEffect(() => {
    const families = FONT_OPTIONS.map(
      (f) => `family=${encodeURIComponent(f)}:wght@400;700`
    ).join("&");
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // Fetch current settings
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.brand_color) setBrandColor(d.brand_color);
        if (d.accent_color) setAccentColor(d.accent_color);
        if (d.font_family) setFontFamily(d.font_family);
        if (d.logo_url) setLogoUrl(d.logo_url);
      });
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload-logo", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setLogoUrl(json.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_color: brandColor,
          accent_color: accentColor,
          font_family: fontFamily,
          logo_url: logoUrl,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-black uppercase tracking-widest text-brand">
        Appearance
      </h1>

      {/* ── Colors ── */}
      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <h2 className="section-heading">Brand Colors</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="form-label">Primary Color</label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="form-input font-mono"
                placeholder="#1a1a2e"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Accent Color</label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="form-input font-mono"
                placeholder="#e94560"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div
            className="rounded-xl px-5 py-2 text-white text-sm font-bold"
            style={{ backgroundColor: brandColor }}
          >
            Primary
          </div>
          <div
            className="rounded-xl px-5 py-2 text-white text-sm font-bold"
            style={{ backgroundColor: accentColor }}
          >
            Accent
          </div>
        </div>
      </section>

      {/* ── Font ── */}
      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="section-heading">Font</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font}
              onClick={() => setFontFamily(font)}
              className={`border rounded-xl px-3 py-3 text-sm transition text-left ${
                fontFamily === font
                  ? "border-brand-accent bg-brand-accent/5 text-brand-accent font-semibold"
                  : "border-gray-200 hover:border-gray-400 text-gray-700"
              }`}
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
        <p
          className="text-base text-gray-600 mt-2"
          style={{ fontFamily: fontFamily }}
        >
          Preview: The quick brown fox jumps over the lazy dog.
        </p>
      </section>

      {/* ── Logo ── */}
      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="section-heading">Logo</h2>
        {logoUrl && (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Current logo"
              className="h-16 w-16 object-contain rounded-lg border border-gray-200 bg-gray-50 p-1"
            />
            <button
              onClick={() => setLogoUrl(null)}
              className="text-red-500 text-sm hover:underline"
            >
              Remove
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="border border-gray-300 rounded-xl px-4 py-2 text-sm hover:border-gray-500 transition disabled:opacity-50"
        >
          {uploading ? "Uploading…" : logoUrl ? "Replace logo" : "Upload logo"}
        </button>
        <p className="text-xs text-gray-400">
          PNG or SVG recommended. Appears in the site header next to the name.
        </p>
      </section>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-brand-accent hover:bg-red-600 text-white font-bold py-4 rounded-2xl text-lg uppercase tracking-widest transition disabled:opacity-60 shadow-lg"
      >
        {saved ? "Saved ✓" : saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
