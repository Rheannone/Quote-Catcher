"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

type FieldType =
  | "text" | "email" | "tel" | "url" | "date"
  | "number" | "textarea" | "select" | "radio"
  | "checkbox" | "checkbox_group" | "print_item";

type CustomField = {
  id: string;
  label: string;
  field_type: FieldType;
  required: boolean;
  options: string[] | null;
  sort_order: number;
  active: boolean;
  section: string;
  placeholder?: string | null;
  field_key?: string | null;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTION_ORDER = ["contact", "project", "print", "additional"];

const SECTION_LABELS: Record<string, string> = {
  contact:    "Contact Information",
  project:    "Project Details",
  print:      "Print Specifications",
  additional: "Additional Information",
};

const TYPE_META: Record<FieldType, { label: string; icon: string; hint: string }> = {
  text:          { label: "Short text",   icon: "Aa", hint: "Single-line text" },
  textarea:      { label: "Long text",    icon: "\u00b6",  hint: "Multi-line text area" },
  email:         { label: "Email",        icon: "@",  hint: "Email address" },
  tel:           { label: "Phone",        icon: "\u260e",  hint: "Phone number" },
  url:           { label: "Website",      icon: "\u2197",  hint: "URL / web address" },
  date:          { label: "Date",         icon: "\u25a1\u2666", hint: "Date picker" },
  number:        { label: "Number",       icon: "#",  hint: "Numeric input" },
  select:        { label: "Dropdown",     icon: "\u25be",  hint: "Pick one option" },
  radio:         { label: "Radio",        icon: "\u25ce",  hint: "Pick one (visible list)" },
  checkbox:      { label: "Checkbox",     icon: "\u2611",  hint: "Single yes / no" },
  checkbox_group:{ label: "Multi-check",  icon: "\u2610\u2611", hint: "Pick multiple options" },
  print_item:    { label: "Print Item",   icon: "\u229e",  hint: "What to print + optional detail expander" },
};

const BUILTIN_SECTIONS = [
  { key: "contact",    label: "Contact Information" },
  { key: "project",    label: "Project Details" },
  { key: "print",      label: "Print Specifications" },
  { key: "additional", label: "Additional Information" },
];

const FONT_OPTIONS = [
  "Inter", "Montserrat", "Oswald", "Raleway",
  "Roboto", "Playfair Display", "Bebas Neue", "Poppins",
] as const;

const HEADER_STYLES = [
  {
    key: "bar-left",
    label: "Bar · Left",
    preview: (
      <div className="w-full h-8 bg-gray-800 rounded flex items-center px-2 gap-1.5">
        <div className="w-8 h-2.5 bg-white/60 rounded" />
      </div>
    ),
  },
  {
    key: "bar-center",
    label: "Bar · Center",
    preview: (
      <div className="w-full h-8 bg-gray-800 rounded flex items-center justify-center px-2">
        <div className="w-8 h-2.5 bg-white/60 rounded" />
      </div>
    ),
  },
  {
    key: "splash",
    label: "Splash",
    preview: (
      <div className="w-full h-10 bg-gray-800 rounded flex flex-col items-center justify-center gap-1">
        <div className="w-5 h-5 bg-white/40 rounded-full" />
        <div className="w-10 h-1.5 bg-white/60 rounded" />
      </div>
    ),
  },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseOptions(str: string): string[] | null {
  const arr = str.split(",").map((s) => s.trim()).filter(Boolean);
  return arr.length > 0 ? arr : null;
}

function optionsToString(opts: string[] | null): string {
  return opts?.join(", ") ?? "";
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? "bg-brand-accent" : "bg-gray-300"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

// ── TypePicker ────────────────────────────────────────────────────────────────

function TypePicker({ value, onChange }: { value: FieldType; onChange: (t: FieldType) => void }) {
  return (
    <div>
      <label className="form-label">Field type</label>
      <div className="grid grid-cols-4 gap-1.5">
        {(Object.entries(TYPE_META) as [FieldType, (typeof TYPE_META)[FieldType]][]).map(([type, m]) => (
          <button key={type} onClick={() => onChange(type)}
            className={`flex flex-col items-center gap-1 rounded-xl border py-2 px-1 text-xs transition ${
              value === type ? "border-brand-accent bg-brand-accent/5 text-brand-accent font-semibold" : "border-gray-200 text-gray-500 hover:border-gray-400"
            }`}
          >
            <span className="text-sm font-bold leading-none">{m.icon}</span>
            <span className="leading-tight text-center text-[10px]">{m.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1">{TYPE_META[value].hint}</p>
    </div>
  );
}

// ── SectionPicker ─────────────────────────────────────────────────────────────

function SectionPicker({ value, onChange, extraSections }: { value: string; onChange: (s: string) => void; extraSections: string[] }) {
  const allOptions = [
    ...BUILTIN_SECTIONS,
    ...extraSections.filter((s) => !BUILTIN_SECTIONS.some((b) => b.key === s)).map((s) => ({ key: s, label: s })),
  ];
  return (
    <div>
      <label className="form-label">Section</label>
      <select className="form-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {allOptions.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
      </select>
    </div>
  );
}

// ── FieldPreview ──────────────────────────────────────────────────────────────

function FieldPreview({ field_type, label, options, required, placeholder }: {
  field_type: FieldType; label: string; options: string; required: boolean; placeholder: string;
}) {
  const displayLabel = label || "Untitled field";
  const opts = parseOptions(options) ?? [];
  const ph = placeholder || "Your answer here\u2026";
  const inputDiv = <div className="form-input text-gray-300 text-sm">{ph}</div>;

  if (field_type === "print_item") {
    return (
      <div className="pointer-events-none select-none space-y-2">
        <label className="form-label">{displayLabel}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
        <div className="form-input text-gray-300 text-sm">e.g. Hoodies, T-Shirts&hellip;</div>
        <div className="text-xs font-semibold text-brand-accent">+ Add print details (optional)</div>
      </div>
    );
  }
  if (field_type === "checkbox") {
    return (
      <label className="flex items-center gap-2.5 text-sm pointer-events-none select-none">
        <span className="w-4 h-4 border-2 border-gray-300 rounded shrink-0" />
        <span className="form-label !mb-0">{displayLabel}{required && <span className="text-red-500 ml-0.5">*</span>}</span>
      </label>
    );
  }
  return (
    <div className="pointer-events-none select-none">
      <label className="form-label">{displayLabel}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {field_type === "textarea" ? (
        <div className="form-input min-h-[56px] text-gray-300 text-sm">{ph}</div>
      ) : field_type === "select" ? (
        <div className="form-input text-gray-400 flex items-center justify-between">
          <span>{opts[0] || "Select\u2026"}</span>
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      ) : field_type === "radio" ? (
        <div className="flex flex-wrap gap-5 mt-1">
          {(opts.length ? opts : ["Option A", "Option B"]).map((o) => (
            <span key={o} className="flex items-center gap-1.5 text-sm text-gray-400">
              <span className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />{o}
            </span>
          ))}
        </div>
      ) : field_type === "checkbox_group" ? (
        <div className="flex flex-wrap gap-4 mt-1">
          {(opts.length ? opts : ["Option A", "Option B"]).map((o) => (
            <span key={o} className="flex items-center gap-1.5 text-sm text-gray-400">
              <span className="w-4 h-4 border border-gray-300 rounded shrink-0" />{o}
            </span>
          ))}
        </div>
      ) : field_type === "number" ? (
        <div className="form-input text-gray-300">{placeholder || "0"}</div>
      ) : inputDiv}
    </div>
  );
}

// ── FieldSkeleton ─────────────────────────────────────────────────────────────

function FieldSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[3, 2, 4].map((count, si) => (
        <div key={si} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <div className="h-4 bg-gray-200 rounded w-2/5" />
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-1/4" />
              <div className="h-9 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      ))}
      <div className="h-14 bg-gray-200 rounded-2xl opacity-40" />
    </div>
  );
}

// ── FieldRenderer ─────────────────────────────────────────────────────────────

function FieldRenderer({ field, index, sectionFields, selected, onSelect, onMove, onToggleActive, onDelete }: {
  field: CustomField; index: number; sectionFields: CustomField[]; selected: boolean;
  onSelect: () => void; onMove: (dir: -1 | 1) => void; onToggleActive: () => void; onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const showToolbar = hovered || selected;
  return (
    <div
      className={`relative rounded-xl mt-1 transition-all duration-150 cursor-pointer ${selected ? "ring-2 ring-brand-accent ring-offset-2" : hovered ? "ring-2 ring-gray-300 ring-offset-1" : ""} ${field.active ? "" : "opacity-40"}`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onSelect}
    >
      {showToolbar && (
        <div className="absolute -top-4 right-0 z-20 flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg shadow-lg px-1.5 py-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onMove(-1)} disabled={index === 0} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-20 text-gray-500 text-xs" title="Move up">&#9650;</button>
          <button onClick={() => onMove(1)} disabled={index === sectionFields.length - 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-20 text-gray-500 text-xs" title="Move down">&#9660;</button>
          <span className="w-px h-4 bg-gray-200 mx-0.5" />
          <button onClick={onSelect} className={`p-1.5 rounded text-xs transition ${selected ? "bg-brand-accent/10 text-brand-accent" : "hover:bg-gray-100 text-gray-500"}`} title="Edit">&#9999;&#65038;</button>
          <span className="w-px h-4 bg-gray-200 mx-0.5" />
          <button onClick={onToggleActive} className={`p-1.5 rounded text-xs transition ${field.active ? "text-green-500 hover:bg-green-50" : "text-gray-300 hover:bg-gray-100"}`} title={field.active ? "Hide" : "Show"}>{field.active ? "●" : "○"}</button>
          <span className="w-px h-4 bg-gray-200 mx-0.5" />
          <button onClick={onDelete} className="p-1.5 rounded text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition" title="Delete">&#10005;</button>
        </div>
      )}
      <FieldPreview field_type={field.field_type} label={field.label} options={optionsToString(field.options)} required={field.required} placeholder={field.placeholder ?? ""} />
    </div>
  );
}

// ── EditorPanel ───────────────────────────────────────────────────────────────

function EditorPanel({ field, isNew, defaultSection, extraSections, onSave, onAdd, onCancel, onDelete }: {
  field: CustomField | null; isNew: boolean; defaultSection: string; extraSections: string[];
  onSave: (id: string, patch: Partial<CustomField>) => Promise<void>;
  onAdd: (f: Omit<CustomField, "id" | "sort_order" | "active">) => Promise<void>;
  onCancel: () => void; onDelete: (id: string) => void;
}) {
  const [label, setLabel]             = useState(field?.label ?? "");
  const [fieldType, setFieldType]     = useState<FieldType>(field?.field_type ?? "text");
  const [required, setRequired]       = useState(field?.required ?? false);
  const [options, setOptions]         = useState(optionsToString(field?.options ?? null));
  const [section, setSection]         = useState(field?.section ?? defaultSection);
  const [placeholder, setPlaceholder] = useState(field?.placeholder ?? "");
  const [saving, setSaving]           = useState(false);
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLabel(field?.label ?? "");
    setFieldType(field?.field_type ?? "text");
    setRequired(field?.required ?? false);
    setOptions(optionsToString(field?.options ?? null));
    setSection(field?.section ?? defaultSection);
    setPlaceholder(field?.placeholder ?? "");
    setTimeout(() => labelRef.current?.focus(), 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field?.id, isNew, defaultSection]);

  const dirty = !isNew && field != null && (
    label !== field.label || fieldType !== field.field_type || required !== field.required ||
    options !== optionsToString(field.options) || section !== field.section || placeholder !== (field.placeholder ?? "")
  );
  const needsOptions = fieldType === "select" || fieldType === "radio" || fieldType === "checkbox_group";

  const handleSubmit = async () => {
    if (!label.trim()) return;
    setSaving(true);
    const payload = { label, field_type: fieldType, required, options: needsOptions ? parseOptions(options) : null, section, placeholder: placeholder || null };
    if (isNew) await onAdd(payload as Omit<CustomField, "id" | "sort_order" | "active">);
    else await onSave(field!.id, payload);
    setSaving(false);
  };

  const optList = parseOptions(options);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <h2 className="font-bold text-gray-800 text-sm uppercase tracking-widest">{isNew ? "New field" : "Edit field"}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div>
          <label className="form-label">Question label <span className="text-red-500">*</span></label>
          <input ref={labelRef} className="form-input" value={label} onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. First Name" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSubmit(); }} />
        </div>
        <div>
          <label className="form-label">Placeholder / hint text</label>
          <input className="form-input" value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} placeholder="e.g. Jane" />
        </div>
        <TypePicker value={fieldType} onChange={setFieldType} />
        {needsOptions && (
          <div>
            <label className="form-label">Options <span className="text-gray-400 font-normal text-xs">(comma-separated)</span></label>
            <input className="form-input" value={options} onChange={(e) => setOptions(e.target.value)} placeholder="Option A, Option B, Option C" />
            {optList && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {optList.map((o) => <span key={o} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5">{o}</span>)}
              </div>
            )}
          </div>
        )}
        <SectionPicker value={section} onChange={setSection} extraSections={extraSections} />
        <label className="flex items-center gap-3 text-sm cursor-pointer select-none w-fit">
          <Toggle checked={required} onChange={() => setRequired((r) => !r)} />
          <span className="text-gray-700 font-medium">Required</span>
        </label>
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Preview</p>
          <FieldPreview field_type={fieldType} label={label} options={options} required={required} placeholder={placeholder} />
        </div>
      </div>
      <div className="px-5 py-4 border-t border-gray-100 space-y-2 shrink-0">
        <button onClick={handleSubmit} disabled={saving || !label.trim()}
          className={`w-full font-bold py-2.5 rounded-xl text-sm uppercase tracking-widest transition disabled:opacity-50 ${isNew || dirty ? "bg-brand-accent text-white hover:bg-red-600" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
          {saving ? "Saving\u2026" : isNew ? "Add field" : dirty ? "Save changes" : "Saved \u2713"}
        </button>
        {!isNew && field != null && (
          <button onClick={() => onDelete(field.id)} className="w-full text-sm text-red-400 hover:text-red-600 py-1.5 transition">
            Delete this field
          </button>
        )}
      </div>
    </div>
  );
}

// ── RichTextEditor ────────────────────────────────────────────────────────────

function RichTextEditor({ value, onChange, placeholder = "Type here\u2026" }: {
  value: string; onChange: (html: string) => void; placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (ref.current && !initialized.current && value) {
      ref.current.innerHTML = value;
      initialized.current = true;
    }
  }, [value]);

  const exec = (cmd: string) => {
    document.execCommand(cmd, false, undefined);
    if (ref.current) onChange(ref.current.innerHTML);
    ref.current?.focus();
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-accent focus-within:border-transparent transition">
      <div className="flex gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {[
          { cmd: "bold",      display: "B",  cls: "font-bold" },
          { cmd: "italic",    display: "I",  cls: "italic" },
          { cmd: "underline", display: "U",  cls: "underline" },
        ].map(({ cmd, display, cls }) => (
          <button key={cmd} type="button"
            onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
            className={`w-7 h-7 flex items-center justify-center text-sm rounded hover:bg-gray-200 transition text-gray-600 ${cls}`}
            title={cmd.charAt(0).toUpperCase() + cmd.slice(1)}
          >
            {display}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
        data-placeholder={placeholder}
        className="min-h-[72px] px-3 py-2 text-sm focus:outline-none"
      />
    </div>
  );
}

// ── ThemePanel ────────────────────────────────────────────────────────────────

function ThemePanel({
  brandColor, setBrandColor, accentColor, setAccentColor,
  fontFamily, setFontFamily, logoUrl, setLogoUrl,
  businessName, setBusinessName, instagramUrl, setInstagramUrl,
  contactEmail, setContactEmail, contactPhone, setContactPhone,
  formHeadline, setFormHeadline, formSubtitleHtml, setFormSubtitleHtml,
  headerStyle, setHeaderStyle,
  saving, saved, error, uploading,
  logoRef, onSave, onLogoUpload,
}: {
  brandColor: string; setBrandColor: (v: string) => void;
  accentColor: string; setAccentColor: (v: string) => void;
  fontFamily: string; setFontFamily: (v: string) => void;
  logoUrl: string | null; setLogoUrl: (v: string | null) => void;
  businessName: string; setBusinessName: (v: string) => void;
  instagramUrl: string; setInstagramUrl: (v: string) => void;
  contactEmail: string; setContactEmail: (v: string) => void;
  contactPhone: string; setContactPhone: (v: string) => void;
  formHeadline: string; setFormHeadline: (v: string) => void;
  formSubtitleHtml: string; setFormSubtitleHtml: (v: string) => void;
  headerStyle: string; setHeaderStyle: (v: string) => void;
  saving: boolean; saved: boolean; error: string; uploading: boolean;
  logoRef: React.RefObject<HTMLInputElement>;
  onSave: () => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-100 shrink-0">
        <h2 className="font-bold text-gray-800 text-sm uppercase tracking-widest">Theme</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        {/* Header Style */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Header Layout</p>
          <div className="grid grid-cols-3 gap-2">
            {HEADER_STYLES.map(({ key, label, preview }) => (
              <button key={key} type="button" onClick={() => setHeaderStyle(key)}
                className={`flex flex-col gap-1.5 items-center p-2 rounded-xl border transition ${
                  headerStyle === key ? "border-brand-accent bg-brand-accent/5" : "border-gray-200 hover:border-gray-400"
                }`}
              >
                {preview}
                <span className={`text-[10px] font-semibold ${headerStyle === key ? "text-brand-accent" : "text-gray-500"}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Page Content */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Page Content</p>
          <div>
            <label className="form-label">Form Headline</label>
            <input type="text" className="form-input" value={formHeadline}
              onChange={(e) => setFormHeadline(e.target.value)} placeholder="Request a Quote" />
          </div>
          <div>
            <label className="form-label">Subtitle / description</label>
            <RichTextEditor
              value={formSubtitleHtml}
              onChange={setFormSubtitleHtml}
              placeholder="Fill out the form below and we'll get back to you within 1–3 business days."
            />
          </div>
        </div>

        {/* Business Info */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Business Info</p>
          <div>
            <label className="form-label">Business Name</label>
            <input type="text" className="form-input" value={businessName}
              onChange={(e) => setBusinessName(e.target.value)} placeholder="Latziyela Prints" />
          </div>
          <div>
            <label className="form-label">Instagram URL</label>
            <input type="url" className="form-input" value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://www.instagram.com/latziyela_prints/" />
          </div>
          <div>
            <label className="form-label">Contact Email</label>
            <input type="email" className="form-input" value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)} placeholder="hello@latziyela.com" />
          </div>
          <div>
            <label className="form-label">Contact Phone</label>
            <input type="tel" className="form-input" value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)} placeholder="(555) 000-0000" />
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Brand Colors</p>
          {[
            { label: "Primary", value: brandColor, set: setBrandColor },
            { label: "Accent",  value: accentColor, set: setAccentColor },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="form-label">{label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={value} onChange={(e) => set(e.target.value)} className="w-10 h-9 rounded cursor-pointer border border-gray-300" />
                <input type="text" value={value} onChange={(e) => set(e.target.value)} className="form-input font-mono text-sm" />
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <div className="rounded-lg px-3 py-1.5 text-white text-xs font-bold" style={{ backgroundColor: brandColor }}>Primary</div>
            <div className="rounded-lg px-3 py-1.5 text-white text-xs font-bold" style={{ backgroundColor: accentColor }}>Accent</div>
          </div>
        </div>

        {/* Font */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Font</p>
          <div className="grid grid-cols-2 gap-1.5">
            {FONT_OPTIONS.map((font) => (
              <button key={font} onClick={() => setFontFamily(font)}
                className={`border rounded-lg px-2 py-2 text-xs transition text-left truncate ${
                  fontFamily === font ? "border-brand-accent bg-brand-accent/5 text-brand-accent font-semibold" : "border-gray-200 hover:border-gray-400 text-gray-600"
                }`}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Logo</p>
          {logoUrl && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded border border-gray-200 bg-gray-50 p-0.5" />
              <button onClick={() => setLogoUrl(null)} className="text-red-400 text-xs hover:underline">Remove</button>
            </div>
          )}
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={onLogoUpload} />
          <button onClick={() => logoRef.current?.click()} disabled={uploading}
            className="border border-gray-300 rounded-lg px-3 py-2 text-xs hover:border-gray-500 transition disabled:opacity-50 w-full text-left">
            {uploading ? "Uploading…" : logoUrl ? "Replace logo" : "Upload logo"}
          </button>
          <p className="text-[10px] text-gray-400">PNG or SVG recommended. Replaces business name in header.</p>
        </div>

        {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      </div>
      <div className="px-5 py-4 border-t border-gray-100 shrink-0">
        <button onClick={onSave} disabled={saving}
          className="w-full bg-brand-accent hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm uppercase tracking-widest transition disabled:opacity-60">
          {saved ? "Saved ✓" : saving ? "Saving…" : "Save Theme"}
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FieldsPage() {
  const router = useRouter();

  const [fields, setFields]                 = useState<CustomField[]>([]);
  const [selectedId, setSelectedId]         = useState<string | null>(null);
  const [addingNew, setAddingNew]           = useState(false);
  const [newFieldSection, setNewFieldSection] = useState("additional");
  const [isLoading, setIsLoading]           = useState(true);
  const [seeding, setSeeding]               = useState(false);
  const [error, setError]                   = useState("");
  const [panelTab, setPanelTab]             = useState<"field" | "theme">("field");

  // Theme state
  const [brandColor, setBrandColor]         = useState("#1a1a2e");
  const [accentColor, setAccentColor]       = useState("#e94560");
  const [fontFamily, setFontFamily]         = useState("Inter");
  const [logoUrl, setLogoUrl]               = useState<string | null>(null);
  const [businessName, setBusinessName]     = useState("");
  const [instagramUrl, setInstagramUrl]     = useState("");
  const [contactEmail, setContactEmail]     = useState("");
  const [contactPhone, setContactPhone]     = useState("");
  const [formHeadline, setFormHeadline]     = useState("");
  const [formSubtitleHtml, setFormSubtitleHtml] = useState("");
  const [headerStyle, setHeaderStyle]       = useState("bar-left");
  const [themeSaving, setThemeSaving]       = useState(false);
  const [themeSaved, setThemeSaved]         = useState(false);
  const [themeError, setThemeError]         = useState("");
  const [themeUploading, setThemeUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() =>
    fetch("/api/admin/fields").then((r) => r.json()).then((d) => setFields(Array.isArray(d) ? d : [])),
  []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const r = await fetch("/api/admin/fields");
      const d = await r.json();
      if (Array.isArray(d) && d.length === 0) {
        setSeeding(true);
        const seedRes = await fetch("/api/admin/seed-fields", { method: "POST" });
        const seedJson = await seedRes.json().catch(() => ({}));
        setSeeding(false);
        if (seedJson.error) setError(`Seed failed: ${seedJson.error}`);
        await load();
      } else {
        setFields(Array.isArray(d) ? d : []);
      }
      setIsLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const families = FONT_OPTIONS.map(f => `family=${encodeURIComponent(f)}:wght@400;700`).join("&");
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      if (d.brand_color)        setBrandColor(d.brand_color);
      if (d.accent_color)       setAccentColor(d.accent_color);
      if (d.font_family)        setFontFamily(d.font_family);
      if (d.logo_url !== undefined) setLogoUrl(d.logo_url);
      if (d.business_name)      setBusinessName(d.business_name);
      if (d.instagram_url)      setInstagramUrl(d.instagram_url);
      if (d.contact_email)      setContactEmail(d.contact_email);
      if (d.contact_phone)      setContactPhone(d.contact_phone);
      if (d.form_headline)      setFormHeadline(d.form_headline);
      if (d.form_subtitle_html) setFormSubtitleHtml(d.form_subtitle_html);
      if (d.header_style)       setHeaderStyle(d.header_style);
    });
  }, []);

  const handleThemeSave = async () => {
    setThemeSaving(true); setThemeError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_color: brandColor, accent_color: accentColor, font_family: fontFamily, logo_url: logoUrl,
          business_name: businessName, instagram_url: instagramUrl, contact_email: contactEmail, contact_phone: contactPhone,
          form_headline: formHeadline, form_subtitle_html: formSubtitleHtml, header_style: headerStyle,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setThemeSaved(true);
      setTimeout(() => setThemeSaved(false), 2500);
      router.refresh();
    } catch (err: unknown) {
      setThemeError(err instanceof Error ? err.message : "Save failed");
    } finally { setThemeSaving(false); }
  };

  const handleThemeLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThemeUploading(true);
    try {
      const form = new FormData(); form.append("file", file);
      const res = await fetch("/api/admin/upload-logo", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setLogoUrl(json.url);
    } catch (err: unknown) {
      setThemeError(err instanceof Error ? err.message : "Upload failed");
    } finally { setThemeUploading(false); }
  };

  const selectedField = fields.find((f) => f.id === selectedId) ?? null;

  const sections = useMemo(() => {
    const bySection: Record<string, CustomField[]> = {};
    for (const f of fields) {
      if (!bySection[f.section]) bySection[f.section] = [];
      bySection[f.section].push(f);
    }
    for (const s of Object.keys(bySection)) bySection[s].sort((a, b) => a.sort_order - b.sort_order);
    const knownSections = SECTION_ORDER.filter((s) => bySection[s]);
    const extraSections = Object.keys(bySection).filter((s) => !SECTION_ORDER.includes(s));
    return [...knownSections, ...extraSections].map((s) => ({ key: s, label: SECTION_LABELS[s] ?? s, fields: bySection[s] }));
  }, [fields]);

  const extraSections = useMemo(
    () => fields.map((f) => f.section).filter((s) => !BUILTIN_SECTIONS.some((b) => b.key === s)),
    [fields]
  );

  const handleSave = async (id: string, patch: Partial<CustomField>) => {
    setError("");
    const existing = fields.find((f) => f.id === id)!;
    const res = await fetch(`/api/admin/fields/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...existing, ...patch }),
    });
    if (!res.ok) setError("Failed to save.");
    else { setSelectedId(null); load(); }
  };

  const handleAdd = async (f: Omit<CustomField, "id" | "sort_order" | "active">) => {
    setError("");
    const res = await fetch("/api/admin/fields", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    if (!res.ok) setError("Failed to add field.");
    else { setAddingNew(false); load(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this field? This cannot be undone.")) return;
    await fetch(`/api/admin/fields/${id}`, { method: "DELETE" });
    setSelectedId(null); setAddingNew(false); load();
  };

  const handleToggleActive = async (field: CustomField) => {
    const existing = fields.find((f) => f.id === field.id)!;
    await fetch(`/api/admin/fields/${field.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...existing, active: !field.active }),
    });
    load();
  };

  const move = async (sectionKey: string, index: number, dir: -1 | 1) => {
    const sf = fields.filter((f) => f.section === sectionKey).sort((a, b) => a.sort_order - b.sort_order);
    const a = sf[index]; const b = sf[index + dir];
    if (!b) return;
    await Promise.all([
      fetch(`/api/admin/fields/${a.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...a, sort_order: b.sort_order }) }),
      fetch(`/api/admin/fields/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, sort_order: a.sort_order }) }),
    ]);
    load();
  };

  const openAdd = (section = "additional") => {
    setSelectedId(null); setNewFieldSection(section); setAddingNew(true); setPanelTab("field");
  };
  const closePanel = () => { setSelectedId(null); setAddingNew(false); };

  const showEditor = panelTab === "field" && (addingNew || selectedId !== null);

  return (
    <div className="flex items-start min-h-[calc(100vh-57px)]">
      {/* ── LEFT: WYSIWYG ──────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 px-4 py-8 overflow-y-auto">
        <div className="max-w-xl mx-auto space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black uppercase tracking-widest text-brand">Form Builder</h1>
              {!isLoading && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {fields.filter((f) => f.active).length} visible &middot;{" "}
                  {fields.filter((f) => !f.active).length} hidden &middot;{" "}
                  <span className="text-gray-500">click any field to edit</span>
                </p>
              )}
            </div>
            <button onClick={() => openAdd("additional")}
              className="bg-brand-accent text-white font-bold px-4 py-2 rounded-xl text-sm uppercase tracking-widest hover:bg-red-600 transition">
              + Add Field
            </button>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

          {isLoading || seeding ? (
            <div>
              {seeding && <p className="text-xs text-gray-400 animate-pulse mb-4">Setting up your form fields&hellip;</p>}
              <FieldSkeleton />
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 cursor-pointer hover:border-brand-accent hover:text-brand-accent transition bg-white" onClick={() => openAdd()}>
              <p className="text-4xl font-thin mb-2">+</p>
              <p className="font-semibold">No fields yet</p>
              <p className="text-sm mt-1">Click to add your first field</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map(({ key: sectionKey, label: sectionLabel, fields: sectionFields }) => (
                <section key={sectionKey} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                  <h2 className="section-heading">{sectionLabel}</h2>
                  {sectionFields.map((field, i) => (
                    <FieldRenderer key={field.id} field={field} index={i} sectionFields={sectionFields}
                      selected={selectedId === field.id}
                      onSelect={() => { setSelectedId(field.id); setAddingNew(false); setPanelTab("field"); }}
                      onMove={(dir) => move(sectionKey, i, dir)}
                      onToggleActive={() => handleToggleActive(field)}
                      onDelete={() => handleDelete(field.id)}
                    />
                  ))}
                  <button onClick={() => openAdd(sectionKey)}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-400 hover:border-brand-accent hover:text-brand-accent transition">
                    + Add field to {sectionLabel}
                  </button>
                </section>
              ))}
              <div className="pointer-events-none select-none opacity-40">
                <div className="w-full bg-brand-accent text-white font-bold py-4 rounded-2xl text-center text-lg uppercase tracking-widest">Submit Quote Request</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: customizer panel ─────────────────────────────────────── */}
      <div className="shrink-0 w-[340px] sticky top-[57px] h-[calc(100vh-57px)] flex flex-col border-l border-gray-200 bg-white">

        {/* Tab bar */}
        <div className="flex shrink-0 border-b border-gray-200">
          {(["field", "theme"] as const).map((tab) => (
            <button key={tab} onClick={() => setPanelTab(tab)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition ${
                panelTab === tab ? "text-brand-accent border-b-2 border-brand-accent -mb-px bg-brand-accent/5" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {tab === "field" ? "Field" : "Theme"}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          {panelTab === "theme" ? (
            <ThemePanel
              brandColor={brandColor} setBrandColor={setBrandColor}
              accentColor={accentColor} setAccentColor={setAccentColor}
              fontFamily={fontFamily} setFontFamily={setFontFamily}
              logoUrl={logoUrl} setLogoUrl={setLogoUrl}
              businessName={businessName} setBusinessName={setBusinessName}
              instagramUrl={instagramUrl} setInstagramUrl={setInstagramUrl}
              contactEmail={contactEmail} setContactEmail={setContactEmail}
              contactPhone={contactPhone} setContactPhone={setContactPhone}
              formHeadline={formHeadline} setFormHeadline={setFormHeadline}
              formSubtitleHtml={formSubtitleHtml} setFormSubtitleHtml={setFormSubtitleHtml}
              headerStyle={headerStyle} setHeaderStyle={setHeaderStyle}
              saving={themeSaving} saved={themeSaved} error={themeError} uploading={themeUploading}
              logoRef={logoRef} onSave={handleThemeSave} onLogoUpload={handleThemeLogoUpload}
            />
          ) : showEditor ? (
            <EditorPanel
              field={addingNew ? null : selectedField} isNew={addingNew}
              defaultSection={newFieldSection} extraSections={extraSections}
              onSave={handleSave} onAdd={handleAdd} onCancel={closePanel} onDelete={handleDelete}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 text-gray-400">
              <span className="text-4xl mb-3 opacity-30">&#9999;&#65038;</span>
              <p className="text-sm font-medium text-gray-500">Click any field to edit it</p>
              <p className="text-xs mt-1">Or use &ldquo;+ Add Field&rdquo; to create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
