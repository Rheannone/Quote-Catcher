"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type FieldType = "text" | "textarea" | "select" | "checkbox" | "number";

type CustomField = {
  id: string;
  label: string;
  field_type: FieldType;
  required: boolean;
  options: string[] | null;
  sort_order: number;
  active: boolean;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<FieldType, { label: string; icon: string; hint: string }> = {
  text:     { label: "Short text", icon: "Aa", hint: "Single-line text input" },
  textarea: { label: "Long text",  icon: "\u00b6",  hint: "Multi-line text area" },
  select:   { label: "Dropdown",   icon: "\u25be",  hint: "Customer picks one option" },
  checkbox: { label: "Checkbox",   icon: "\u2611",  hint: "Yes / No toggle" },
  number:   { label: "Number",     icon: "#",  hint: "Numeric input" },
};

function parseOptions(str: string): string[] | null {
  const arr = str.split(",").map((s) => s.trim()).filter(Boolean);
  return arr.length > 0 ? arr : null;
}

function optionsToString(opts: string[] | null): string {
  return opts?.join(", ") ?? "";
}

// ── FieldRenderer ─────────────────────────────────────────────────────────────
// Renders a field exactly like it appears on the public quote form.
// Hover / click shows an action toolbar. Selected field gets a ring.

function FieldRenderer({
  field,
  index,
  total,
  selected,
  onSelect,
  onMove,
  onToggleActive,
  onDelete,
}: {
  field: CustomField;
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
  onMove: (dir: -1 | 1) => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const opts = field.options ?? [];
  const showToolbar = hovered || selected;

  return (
    <div
      className={`relative rounded-xl transition-all duration-150 cursor-pointer ${
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
          {/* Move arrows */}
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-20 text-gray-500 text-xs leading-none"
            title="Move up"
          >
            &#9650;
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-20 text-gray-500 text-xs leading-none"
            title="Move down"
          >
            &#9660;
          </button>

          <span className="w-px h-4 bg-gray-200 mx-0.5" />

          {/* Edit */}
          <button
            onClick={onSelect}
            className={`p-1.5 rounded text-xs leading-none transition ${
              selected ? "bg-brand-accent/10 text-brand-accent" : "hover:bg-gray-100 text-gray-500"
            }`}
            title="Edit field"
          >
            &#9999;&#65038;
          </button>

          <span className="w-px h-4 bg-gray-200 mx-0.5" />

          {/* Active toggle */}
          <button
            onClick={onToggleActive}
            className={`p-1.5 rounded text-xs leading-none transition ${
              field.active
                ? "text-green-500 hover:bg-green-50"
                : "text-gray-300 hover:bg-gray-100"
            }`}
            title={field.active ? "Hide from form" : "Show on form"}
          >
            {field.active ? "●" : "○"}
          </button>

          <span className="w-px h-4 bg-gray-200 mx-0.5" />

          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-1.5 rounded text-xs leading-none text-red-400 hover:bg-red-50 hover:text-red-600 transition"
            title="Delete field"
          >
            &#10005;
          </button>
        </div>
      )}

      {/* Field rendered exactly like the public form */}
      <div className="py-0.5 pointer-events-none select-none">
        {field.field_type === "checkbox" ? (
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              readOnly
              tabIndex={-1}
              className="accent-brand-accent w-4 h-4 shrink-0"
            />
            <span className="form-label !mb-0">
              {field.label || <em className="text-gray-300 not-italic">Untitled</em>}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </span>
          </label>
        ) : (
          <div>
            <label className="form-label">
              {field.label || <em className="text-gray-300 not-italic">Untitled field</em>}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>

            {field.field_type === "textarea" && (
              <div className="form-input min-h-[72px] text-gray-300 text-sm">
                Your answer here&hellip;
              </div>
            )}

            {field.field_type === "select" && (
              <div className="form-input text-gray-400 flex items-center justify-between">
                <span>{opts[0] || "Select an option\u2026"}</span>
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            )}

            {field.field_type === "number" && (
              <div className="form-input text-gray-300">0</div>
            )}

            {field.field_type === "text" && (
              <div className="form-input text-gray-300">Your answer here&hellip;</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TypePicker ─────────────────────────────────────────────────────────────────

function TypePicker({
  value,
  onChange,
}: {
  value: FieldType;
  onChange: (t: FieldType) => void;
}) {
  return (
    <div>
      <label className="form-label">Field type</label>
      <div className="grid grid-cols-5 gap-1.5">
        {(Object.entries(TYPE_META) as [FieldType, (typeof TYPE_META)[FieldType]][]).map(
          ([type, m]) => (
            <button
              key={type}
              onClick={() => onChange(type)}
              className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 px-1 text-xs transition ${
                value === type
                  ? "border-brand-accent bg-brand-accent/5 text-brand-accent font-semibold"
                  : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              <span className="text-base font-bold leading-none">{m.icon}</span>
              <span className="leading-tight text-center">{m.label}</span>
            </button>
          )
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1.5">{TYPE_META[value].hint}</p>
    </div>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
        checked ? "bg-brand-accent" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ── EditorPanel ───────────────────────────────────────────────────────────────
// Right-side sticky panel. isNew=true → "Add field" mode.

function EditorPanel({
  field,
  isNew,
  onSave,
  onAdd,
  onCancel,
  onDelete,
}: {
  field: CustomField | null;
  isNew: boolean;
  onSave: (id: string, patch: Partial<CustomField>) => Promise<void>;
  onAdd: (f: Omit<CustomField, "id" | "sort_order" | "active">) => Promise<void>;
  onCancel: () => void;
  onDelete: (id: string) => void;
}) {
  const [label, setLabel] = useState(field?.label ?? "");
  const [fieldType, setFieldType] = useState<FieldType>(field?.field_type ?? "text");
  const [required, setRequired] = useState(field?.required ?? false);
  const [options, setOptions] = useState(optionsToString(field?.options ?? null));
  const [saving, setSaving] = useState(false);
  const labelRef = useRef<HTMLInputElement>(null);

  // Reset state whenever the selected field changes
  useEffect(() => {
    setLabel(field?.label ?? "");
    setFieldType(field?.field_type ?? "text");
    setRequired(field?.required ?? false);
    setOptions(optionsToString(field?.options ?? null));
    setTimeout(() => labelRef.current?.focus(), 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field?.id, isNew]);

  const dirty =
    !isNew &&
    field != null &&
    (label !== field.label ||
      fieldType !== field.field_type ||
      required !== field.required ||
      options !== optionsToString(field.options));

  const handleSubmit = async () => {
    if (!label.trim()) return;
    setSaving(true);
    if (isNew) {
      await onAdd({
        label,
        field_type: fieldType,
        required,
        options: fieldType === "select" ? parseOptions(options) : null,
      });
    } else {
      await onSave(field!.id, {
        label,
        field_type: fieldType,
        required,
        options: fieldType === "select" ? parseOptions(options) : null,
      });
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
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none transition"
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Label input */}
        <div>
          <label className="form-label">
            Question label <span className="text-red-500">*</span>
          </label>
          <input
            ref={labelRef}
            className="form-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Preferred turnaround time"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) handleSubmit();
            }}
          />
        </div>

        {/* Type picker */}
        <TypePicker value={fieldType} onChange={setFieldType} />

        {/* Options (only for select) */}
        {fieldType === "select" && (
          <div>
            <label className="form-label">
              Options{" "}
              <span className="text-gray-400 font-normal text-xs">(comma-separated)</span>
            </label>
            <input
              className="form-input"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              placeholder="Rush (3&#8211;5 days), Standard (1&#8211;2 weeks), Flexible"
            />
            {optList && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {optList.map((o) => (
                  <span
                    key={o}
                    className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5"
                  >
                    {o}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Required toggle */}
        <label className="flex items-center gap-3 text-sm cursor-pointer select-none w-fit">
          <Toggle checked={required} onChange={() => setRequired((r) => !r)} />
          <span className="text-gray-700 font-medium">Required</span>
        </label>

        {/* Mini live preview inside the panel */}
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Preview
          </p>
          {fieldType === "checkbox" ? (
            <label className="flex items-center gap-2.5 text-sm pointer-events-none select-none">
              <input type="checkbox" readOnly className="accent-brand-accent w-4 h-4" />
              <span className="form-label !mb-0">
                {label || <em className="text-gray-300 not-italic">Untitled</em>}
                {required && <span className="text-red-500 ml-0.5">*</span>}
              </span>
            </label>
          ) : (
            <div className="pointer-events-none select-none">
              <label className="form-label">
                {label || <em className="text-gray-300 not-italic">Untitled field</em>}
                {required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              {fieldType === "textarea" && (
                <div className="form-input min-h-[56px] text-gray-300 text-sm">
                  Your answer here&hellip;
                </div>
              )}
              {fieldType === "select" && (
                <div className="form-input text-gray-400 flex items-center justify-between">
                  <span>
                    {parseOptions(options)?.[0] || "Select an option\u2026"}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              )}
              {fieldType === "number" && (
                <div className="form-input text-gray-300">0</div>
              )}
              {fieldType === "text" && (
                <div className="form-input text-gray-300">Your answer here&hellip;</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
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
          {saving
            ? "Saving\u2026"
            : isNew
            ? "Add field"
            : dirty
            ? "Save changes"
            : "Saved \u2713"}
        </button>

        {!isNew && field != null && (
          <button
            onClick={() => onDelete(field.id)}
            className="w-full text-sm text-red-400 hover:text-red-600 py-1.5 transition"
          >
            Delete this field
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    return fetch("/api/admin/fields")
      .then((r) => r.json())
      .then((d) => setFields(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectedField = fields.find((f) => f.id === selectedId) ?? null;
  const panelOpen = addingNew || selectedId !== null;

  // ── CRUD handlers ────────────────────────────────────────────────────────

  const handleSave = async (id: string, patch: Partial<CustomField>) => {
    setError("");
    const existing = fields.find((f) => f.id === id)!;
    const res = await fetch(`/api/admin/fields/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...existing, ...patch }),
    });
    if (!res.ok) {
      setError("Failed to save field.");
    } else {
      setSelectedId(null);
      load();
    }
  };

  const handleAdd = async (f: Omit<CustomField, "id" | "sort_order" | "active">) => {
    setError("");
    const res = await fetch("/api/admin/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    if (!res.ok) {
      setError("Failed to add field.");
    } else {
      setAddingNew(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this field?")) return;
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

  const move = async (index: number, dir: -1 | 1) => {
    const a = fields[index];
    const b = fields[index + dir];
    if (!b) return;
    await Promise.all([
      fetch(`/api/admin/fields/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...a, sort_order: b.sort_order }),
      }),
      fetch(`/api/admin/fields/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...b, sort_order: a.sort_order }),
      }),
    ]);
    load();
  };

  const closePanel = () => {
    setSelectedId(null);
    setAddingNew(false);
  };

  const openAdd = () => {
    setSelectedId(null);
    setAddingNew(true);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex items-start">
      {/* ── LEFT: form preview ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 px-4 py-8">
        <div className="max-w-xl mx-auto space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black uppercase tracking-widest text-brand">
                Form Fields
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {fields.filter((f) => f.active).length} active &middot;{" "}
                {fields.filter((f) => !f.active).length} hidden
              </p>
            </div>
            <button
              onClick={openAdd}
              className="bg-brand-accent text-white font-bold px-4 py-2 rounded-xl text-sm uppercase tracking-widest hover:bg-red-600 transition"
            >
              + Add Field
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          {/* ── The form card — identical styling to the real quote form ── */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <div>
              <h2 className="section-heading">Additional Information</h2>
              <p className="text-xs text-gray-400 -mt-3 mb-1">
                This is exactly how your fields appear on the quote form.
                Click a field to edit it.
              </p>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                <p className="text-3xl font-thin mb-2">+</p>
                <p className="font-semibold text-gray-500">No custom fields yet</p>
                <p className="text-sm mt-1">
                  Click &ldquo;+ Add Field&rdquo; above to add questions to your quote form
                </p>
              </div>
            ) : (
              <div className="space-y-5 pt-1">
                {fields.map((field, i) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    index={i}
                    total={fields.length}
                    selected={selectedId === field.id}
                    onSelect={() => {
                      setSelectedId(field.id);
                      setAddingNew(false);
                    }}
                    onMove={(dir) => move(i, dir)}
                    onToggleActive={() => handleToggleActive(field)}
                    onDelete={() => handleDelete(field.id)}
                  />
                ))}
              </div>
            )}

            {/* Bottom add-field button */}
            <button
              onClick={openAdd}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-400 hover:border-brand-accent hover:text-brand-accent transition"
            >
              + Add a field
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT: sticky editor panel ─────────────────────────────────── */}
      <div
        className={`shrink-0 overflow-hidden transition-all duration-300 ${
          panelOpen ? "w-[340px]" : "w-0"
        }`}
      >
        <div
          className="w-[340px] sticky top-[57px] h-[calc(100vh-57px)] flex flex-col"
        >
          {panelOpen && (
            <EditorPanel
              field={addingNew ? null : selectedField}
              isNew={addingNew}
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
