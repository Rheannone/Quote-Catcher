"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type FieldType =
  | "text" | "email" | "tel" | "url" | "date"
  | "number" | "textarea" | "select" | "radio"
  | "checkbox" | "checkbox_group";

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
  text:          { label: "Short text",  icon: "Aa", hint: "Single-line text" },
  textarea:      { label: "Long text",   icon: "\u00b6",  hint: "Multi-line text area" },
  email:         { label: "Email",       icon: "@",  hint: "Email address" },
  tel:           { label: "Phone",       icon: "\u260e",  hint: "Phone number" },
  url:           { label: "Website",     icon: "\u2197",  hint: "URL / web address" },
  date:          { label: "Date",        icon: "\u25a1\u2666", hint: "Date picker" },
  number:        { label: "Number",      icon: "#",  hint: "Numeric input" },
  select:        { label: "Dropdown",    icon: "\u25be",  hint: "Pick one option" },
  radio:         { label: "Radio",       icon: "\u25ce",  hint: "Pick one (visible list)" },
  checkbox:      { label: "Checkbox",    icon: "\u2611",  hint: "Single yes / no" },
  checkbox_group:{ label: "Multi-check", icon: "\u2610\u2611", hint: "Pick multiple options" },
};

const BUILTIN_SECTIONS = [
  { key: "contact",    label: "Contact Information" },
  { key: "project",    label: "Project Details" },
  { key: "print",      label: "Print Specifications" },
  { key: "additional", label: "Additional Information" },
];

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
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
      />
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
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`flex flex-col items-center gap-1 rounded-xl border py-2 px-1 text-xs transition ${
              value === type
                ? "border-brand-accent bg-brand-accent/5 text-brand-accent font-semibold"
                : "border-gray-200 text-gray-500 hover:border-gray-400"
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

function SectionPicker({
  value,
  onChange,
  extraSections,
}: {
  value: string;
  onChange: (s: string) => void;
  extraSections: string[];
}) {
  const allOptions = [
    ...BUILTIN_SECTIONS,
    ...extraSections
      .filter((s) => !BUILTIN_SECTIONS.some((b) => b.key === s))
      .map((s) => ({ key: s, label: s })),
  ];

  return (
    <div>
      <label className="form-label">Section</label>
      <select
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {allOptions.map(({ key, label }) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
    </div>
  );
}

// ── FieldPreview ──────────────────────────────────────────────────────────────
// Renders a field exactly as it appears on the live public form.

function FieldPreview({
  field_type,
  label,
  options,
  required,
  placeholder,
}: {
  field_type: FieldType;
  label: string;
  options: string;
  required: boolean;
  placeholder: string;
}) {
  const displayLabel = label || "Untitled field";
  const opts = parseOptions(options) ?? [];
  const ph = placeholder || "Your answer here\u2026";

  const inputDiv = (
    <div className="form-input text-gray-300 text-sm">{ph}</div>
  );

  if (field_type === "checkbox") {
    return (
      <label className="flex items-center gap-2.5 text-sm pointer-events-none select-none">
        <span className="w-4 h-4 border-2 border-gray-300 rounded shrink-0" />
        <span className="form-label !mb-0">
          {displayLabel}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      </label>
    );
  }

  return (
    <div className="pointer-events-none select-none">
      <label className="form-label">
        {displayLabel}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {field_type === "textarea" ? (
        <div className="form-input min-h-[56px] text-gray-300 text-sm">{ph}</div>
      ) : field_type === "select" ? (
        <div className="form-input text-gray-400 flex items-center justify-between">
          <span>{opts[0] || "Select\u2026"}</span>
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      ) : field_type === "radio" ? (
        <div className="flex flex-wrap gap-5 mt-1">
          {(opts.length ? opts : ["Option A", "Option B"]).map((o) => (
            <span key={o} className="flex items-center gap-1.5 text-sm text-gray-400">
              <span className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
              {o}
            </span>
          ))}
        </div>
      ) : field_type === "checkbox_group" ? (
        <div className="flex flex-wrap gap-4 mt-1">
          {(opts.length ? opts : ["Option A", "Option B"]).map((o) => (
            <span key={o} className="flex items-center gap-1.5 text-sm text-gray-400">
              <span className="w-4 h-4 border border-gray-300 rounded shrink-0" />
              {o}
            </span>
          ))}
        </div>
      ) : field_type === "number" ? (
        <div className="form-input text-gray-300">{placeholder || "0"}</div>
      ) : (
        inputDiv
      )}
    </div>
  );
}

// ── FieldRenderer ─────────────────────────────────────────────────────────────
// A clickable field card with hover toolbar in the WYSIWYG left panel.

function FieldRenderer({
  field,
  index,
  sectionFields,
  selected,
  onSelect,
  onMove,
  onToggleActive,
  onDelete,
}: {
  field: CustomField;
  index: number;
  sectionFields: CustomField[];
  selected: boolean;
  onSelect: () => void;
  onMove: (dir: -1 | 1) => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const showToolbar = hovered || selected;

  return (
    <div
      className={`relative rounded-xl mt-1 transition-all duration-150 cursor-pointer ${
        selected
          ? "ring-2 ring-brand-accent ring-offset-2"
          : hovered
          ? "ring-2 ring-gray-300 ring-offset-1"
          : ""
      } ${field.active ? "" : "opacity-40"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* Floating toolbar */}
      {showToolbar && (
        <div
          className="absolute -top-4 right-0 z-20 flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg shadow-lg px-1.5 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => onMove(-1)} disabled={index === 0}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-20 text-gray-500 text-xs leading-none" title="Move up">&#9650;</button>
          <button onClick={() => onMove(1)} disabled={index === sectionFields.length - 1}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-20 text-gray-500 text-xs leading-none" title="Move down">&#9660;</button>
          <span className="w-px h-4 bg-gray-200 mx-0.5" />
          <button onClick={onSelect}
            className={`p-1.5 rounded text-xs leading-none transition ${selected ? "bg-brand-accent/10 text-brand-accent" : "hover:bg-gray-100 text-gray-500"}`}
            title="Edit field">&#9999;&#65038;</button>
          <span className="w-px h-4 bg-gray-200 mx-0.5" />
          <button onClick={onToggleActive}
            className={`p-1.5 rounded text-xs leading-none transition ${field.active ? "text-green-500 hover:bg-green-50" : "text-gray-300 hover:bg-gray-100"}`}
            title={field.active ? "Hide from form" : "Show on form"}>
            {field.active ? "●" : "○"}
          </button>
          <span className="w-px h-4 bg-gray-200 mx-0.5" />
          <button onClick={onDelete}
            className="p-1.5 rounded text-xs leading-none text-red-400 hover:bg-red-50 hover:text-red-600 transition"
            title="Delete field">&#10005;</button>
        </div>
      )}

      {/* Field rendered exactly like the public form */}
      <FieldPreview
        field_type={field.field_type}
        label={field.label}
        options={optionsToString(field.options)}
        required={field.required}
        placeholder={field.placeholder ?? ""}
      />
    </div>
  );
}

// ── EditorPanel ───────────────────────────────────────────────────────────────

function EditorPanel({
  field,
  isNew,
  defaultSection,
  extraSections,
  onSave,
  onAdd,
  onCancel,
  onDelete,
}: {
  field: CustomField | null;
  isNew: boolean;
  defaultSection: string;
  extraSections: string[];
  onSave: (id: string, patch: Partial<CustomField>) => Promise<void>;
  onAdd: (f: Omit<CustomField, "id" | "sort_order" | "active">) => Promise<void>;
  onCancel: () => void;
  onDelete: (id: string) => void;
}) {
  const [label, setLabel]           = useState(field?.label ?? "");
  const [fieldType, setFieldType]   = useState<FieldType>(field?.field_type ?? "text");
  const [required, setRequired]     = useState(field?.required ?? false);
  const [options, setOptions]       = useState(optionsToString(field?.options ?? null));
  const [section, setSection]       = useState(field?.section ?? defaultSection);
  const [placeholder, setPlaceholder] = useState(field?.placeholder ?? "");
  const [saving, setSaving]         = useState(false);
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

  const dirty =
    !isNew && field != null && (
      label !== field.label ||
      fieldType !== field.field_type ||
      required !== field.required ||
      options !== optionsToString(field.options) ||
      section !== field.section ||
      placeholder !== (field.placeholder ?? "")
    );

  const needsOptions = fieldType === "select" || fieldType === "radio" || fieldType === "checkbox_group";

  const handleSubmit = async () => {
    if (!label.trim()) return;
    setSaving(true);
    const payload = {
      label,
      field_type: fieldType,
      required,
      options: needsOptions ? parseOptions(options) : null,
      section,
      placeholder: placeholder || null,
    };
    if (isNew) {
      await onAdd(payload as Omit<CustomField, "id" | "sort_order" | "active">);
    } else {
      await onSave(field!.id, payload);
    }
    setSaving(false);
  };

  const optList = parseOptions(options);

  return (
    <div className="flex flex-col h-full border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <h2 className="font-bold text-gray-800 text-sm uppercase tracking-widest">
          {isNew ? "New field" : "Edit field"}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Close">
          &times;
        </button>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Label */}
        <div>
          <label className="form-label">Question label <span className="text-red-500">*</span></label>
          <input
            ref={labelRef}
            className="form-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. First Name"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSubmit(); }}
          />
        </div>

        {/* Placeholder */}
        <div>
          <label className="form-label">Placeholder / hint text</label>
          <input
            className="form-input"
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            placeholder="e.g. Jane"
          />
        </div>

        {/* Type picker */}
        <TypePicker value={fieldType} onChange={setFieldType} />

        {/* Options */}
        {needsOptions && (
          <div>
            <label className="form-label">
              Options <span className="text-gray-400 font-normal text-xs">(comma-separated)</span>
            </label>
            <input
              className="form-input"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              placeholder="Option A, Option B, Option C"
            />
            {optList && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {optList.map((o) => (
                  <span key={o} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5">{o}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section */}
        <SectionPicker value={section} onChange={setSection} extraSections={extraSections} />

        {/* Required */}
        <label className="flex items-center gap-3 text-sm cursor-pointer select-none w-fit">
          <Toggle checked={required} onChange={() => setRequired((r) => !r)} />
          <span className="text-gray-700 font-medium">Required</span>
        </label>

        {/* Live preview in panel */}
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Preview</p>
          <FieldPreview
            field_type={fieldType}
            label={label}
            options={options}
            required={required}
            placeholder={placeholder}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 space-y-2 shrink-0">
        <button
          onClick={handleSubmit}
          disabled={saving || !label.trim()}
          className={`w-full font-bold py-2.5 rounded-xl text-sm uppercase tracking-widest transition disabled:opacity-50 ${
            isNew || dirty
              ? "bg-brand-accent text-white hover:bg-red-600"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving\u2026" : isNew ? "Add field" : dirty ? "Save changes" : "Saved \u2713"}
        </button>
        {!isNew && field != null && (
          <button onClick={() => onDelete(field.id)}
            className="w-full text-sm text-red-400 hover:text-red-600 py-1.5 transition">
            Delete this field
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FieldsPage() {
  const [fields, setFields]       = useState<CustomField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newFieldSection, setNewFieldSection] = useState("additional");
  const [seeding, setSeeding]     = useState(false);
  const [error, setError]         = useState("");

  const load = useCallback(() =>
    fetch("/api/admin/fields")
      .then((r) => r.json())
      .then((d) => setFields(Array.isArray(d) ? d : [])),
  []);

  // Auto-seed default fields if this admin has none yet
  useEffect(() => {
    fetch("/api/admin/fields")
      .then((r) => r.json())
      .then(async (d) => {
        if (Array.isArray(d) && d.length === 0) {
          setSeeding(true);
          await fetch("/api/admin/seed-fields", { method: "POST" });
          setSeeding(false);
        }
        setFields(Array.isArray(d) ? d : []);
        // Reload after seeding
        if (Array.isArray(d) && d.length === 0) load();
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedField = fields.find((f) => f.id === selectedId) ?? null;
  const panelOpen = addingNew || selectedId !== null;

  // Build section groups in display order
  const sections = useMemo(() => {
    const bySection: Record<string, CustomField[]> = {};
    for (const f of fields) {
      if (!bySection[f.section]) bySection[f.section] = [];
      bySection[f.section].push(f);
    }
    for (const s of Object.keys(bySection)) {
      bySection[s].sort((a, b) => a.sort_order - b.sort_order);
    }
    const knownSections = SECTION_ORDER.filter((s) => bySection[s]);
    const extraSections = Object.keys(bySection).filter((s) => !SECTION_ORDER.includes(s));
    return [...knownSections, ...extraSections].map((s) => ({
      key: s,
      label: SECTION_LABELS[s] ?? s,
      fields: bySection[s],
    }));
  }, [fields]);

  const extraSections = useMemo(
    () => fields.map((f) => f.section).filter((s) => !BUILTIN_SECTIONS.some((b) => b.key === s)),
    [fields]
  );

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const handleSave = async (id: string, patch: Partial<CustomField>) => {
    setError("");
    const existing = fields.find((f) => f.id === id)!;
    const res = await fetch(`/api/admin/fields/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...existing, ...patch }),
    });
    if (!res.ok) setError("Failed to save.");
    else { setSelectedId(null); load(); }
  };

  const handleAdd = async (f: Omit<CustomField, "id" | "sort_order" | "active">) => {
    setError("");
    const res = await fetch("/api/admin/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    if (!res.ok) setError("Failed to add field.");
    else { setAddingNew(false); load(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this field? This cannot be undone.")) return;
    await fetch(`/api/admin/fields/${id}`, { method: "DELETE" });
    setSelectedId(null);
    setAddingNew(false);
    load();
  };

  const handleToggleActive = async (field: CustomField) => {
    const existing = fields.find((f) => f.id === field.id)!;
    await fetch(`/api/admin/fields/${field.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...existing, active: !field.active }),
    });
    load();
  };

  const move = async (sectionKey: string, index: number, dir: -1 | 1) => {
    const sectionFields = fields
      .filter((f) => f.section === sectionKey)
      .sort((a, b) => a.sort_order - b.sort_order);
    const a = sectionFields[index];
    const b = sectionFields[index + dir];
    if (!b) return;
    await Promise.all([
      fetch(`/api/admin/fields/${a.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...a, sort_order: b.sort_order }),
      }),
      fetch(`/api/admin/fields/${b.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...b, sort_order: a.sort_order }),
      }),
    ]);
    load();
  };

  const openAdd = (section = "additional") => {
    setSelectedId(null);
    setNewFieldSection(section);
    setAddingNew(true);
  };

  const closePanel = () => { setSelectedId(null); setAddingNew(false); };

  // ── Render ────────────────────────────────────────────────────────────────

  if (seeding) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p className="text-sm animate-pulse">Setting up your form fields\u2026</p>
      </div>
    );
  }

  return (
    <div className="flex items-start">
      {/* ── LEFT: full-form WYSIWYG ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0 px-4 py-8">
        <div className="max-w-xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black uppercase tracking-widest text-brand">Form Builder</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {fields.filter((f) => f.active).length} visible &middot;{" "}
                {fields.filter((f) => !f.active).length} hidden &middot;{" "}
                <span className="text-gray-500">click any field to edit</span>
              </p>
            </div>
            <button
              onClick={() => openAdd("additional")}
              className="bg-brand-accent text-white font-bold px-4 py-2 rounded-xl text-sm uppercase tracking-widest hover:bg-red-600 transition"
            >
              + Add Field
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          {/* ── Section cards ─────────────────────────────────────────────── */}
          {sections.length === 0 ? (
            <div
              className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 cursor-pointer hover:border-brand-accent hover:text-brand-accent transition bg-white"
              onClick={() => openAdd()}
            >
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
                    <FieldRenderer
                      key={field.id}
                      field={field}
                      index={i}
                      sectionFields={sectionFields}
                      selected={selectedId === field.id}
                      onSelect={() => { setSelectedId(field.id); setAddingNew(false); }}
                      onMove={(dir) => move(sectionKey, i, dir)}
                      onToggleActive={() => handleToggleActive(field)}
                      onDelete={() => handleDelete(field.id)}
                    />
                  ))}

                  {/* Per-section add button */}
                  <button
                    onClick={() => openAdd(sectionKey)}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-400 hover:border-brand-accent hover:text-brand-accent transition"
                  >
                    + Add field to {sectionLabel}
                  </button>
                </section>
              ))}

              {/* Submit button preview */}
              <div className="pointer-events-none select-none opacity-40">
                <div className="w-full bg-brand-accent text-white font-bold py-4 rounded-2xl text-center text-lg uppercase tracking-widest">
                  Submit Quote Request
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: sticky editor panel ──────────────────────────────────── */}
      <div className={`shrink-0 overflow-hidden transition-all duration-300 ${panelOpen ? "w-[360px]" : "w-0"}`}>
        <div className="w-[360px] sticky top-[57px] h-[calc(100vh-57px)] flex flex-col">
          {panelOpen && (
            <EditorPanel
              field={addingNew ? null : selectedField}
              isNew={addingNew}
              defaultSection={newFieldSection}
              extraSections={extraSections}
              onSave={handleSave}
              onAdd={handleAdd}
              onCancel={closePanel}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
