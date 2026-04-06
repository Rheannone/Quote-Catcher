"use client";

import { useState, useEffect, useRef } from "react";

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

const TYPE_META: Record<FieldType, { label: string; icon: string; hint: string }> = {
  text:     { label: "Short text", icon: "Aa", hint: "Single line text input" },
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? "bg-brand-accent" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function TypePicker({ value, onChange }: { value: FieldType; onChange: (t: FieldType) => void }) {
  return (
    <div>
      <label className="form-label">Field type</label>
      <div className="grid grid-cols-5 gap-2">
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
              <span className="text-base font-bold">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          )
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1.5">{TYPE_META[value].hint}</p>
    </div>
  );
}

function FieldPreview({
  field_type,
  label,
  options,
  required,
}: {
  field_type: FieldType;
  label: string;
  options: string;
  required: boolean;
}) {
  const displayLabel = label || "Untitled field";
  const optList = parseOptions(options) ?? [];
  return (
    <div className="pointer-events-none select-none opacity-70 mt-3 border-t border-dashed border-gray-200 pt-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
        Preview
      </p>
      <label className="form-label text-xs">
        {displayLabel}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {field_type === "textarea" ? (
        <div className="form-input bg-gray-50 h-14 text-gray-300 text-xs flex items-start pt-2">
          Your answer&hellip;
        </div>
      ) : field_type === "select" ? (
        <div className="form-input bg-gray-50 text-gray-300 text-xs flex items-center justify-between">
          <span>{optList[0] || "Select\u2026"}</span>
          <span>{"\u25be"}</span>
        </div>
      ) : field_type === "checkbox" ? (
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <span className="w-4 h-4 border border-gray-300 rounded inline-block" />
          {displayLabel}
        </label>
      ) : (
        <div className="form-input bg-gray-50 text-gray-300 text-xs">
          {field_type === "number" ? "0" : "Your answer\u2026"}
        </div>
      )}
    </div>
  );
}

function FieldCard({
  field,
  index,
  total,
  onSave,
  onDelete,
  onMove,
  onToggleActive,
}: {
  field: CustomField;
  index: number;
  total: number;
  onSave: (id: string, patch: Partial<CustomField>) => Promise<void>;
  onDelete: (id: string) => void;
  onMove: (index: number, dir: -1 | 1) => void;
  onToggleActive: (field: CustomField) => void;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(field.label);
  const [fieldType, setFieldType] = useState<FieldType>(field.field_type);
  const [required, setRequired] = useState(field.required);
  const [options, setOptions] = useState(optionsToString(field.options));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const changed =
      label !== field.label ||
      fieldType !== field.field_type ||
      required !== field.required ||
      options !== optionsToString(field.options);
    setDirty(changed);
  }, [label, fieldType, required, options, field]);

  useEffect(() => {
    if (open) setTimeout(() => labelRef.current?.focus(), 50);
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(field.id, {
      label,
      field_type: fieldType,
      required,
      options: fieldType === "select" ? parseOptions(options) : null,
    });
    setSaving(false);
    setDirty(false);
    setOpen(false);
  };

  const handleDiscard = () => {
    setLabel(field.label);
    setFieldType(field.field_type);
    setRequired(field.required);
    setOptions(optionsToString(field.options));
    setDirty(false);
    setOpen(false);
  };

  const meta = TYPE_META[field.field_type];

  return (
    <div
      className={`rounded-2xl border transition-all duration-150 bg-white ${
        open
          ? "border-brand-accent shadow-md"
          : field.active
          ? "border-gray-200 shadow-sm hover:border-gray-300"
          : "border-gray-200 shadow-sm opacity-50"
      }`}
    >
      {/* Collapsed header row */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Reorder arrows */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove(index, -1);
            }}
            disabled={index === 0}
            className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none text-[10px] px-1"
            title="Move up"
          >
            {"\u25b2"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove(index, 1);
            }}
            disabled={index === total - 1}
            className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none text-[10px] px-1"
            title="Move down"
          >
            {"\u25bc"}
          </button>
        </div>

        {/* Type icon */}
        <span className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 text-gray-500 text-sm font-bold flex items-center justify-center">
          {meta.icon}
        </span>

        {/* Label + type */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate leading-tight">{field.label}</p>
          <p className="text-xs text-gray-400">{meta.label}</p>
        </div>

        {dirty && (
          <span className="shrink-0 text-xs text-amber-500 font-semibold">Unsaved</span>
        )}
        {field.required && !dirty && (
          <span className="shrink-0 text-xs text-brand-accent font-semibold">Required</span>
        )}

        {/* Active toggle */}
        <div onClick={(e) => e.stopPropagation()}>
          <Toggle checked={field.active} onChange={() => onToggleActive(field)} />
        </div>

        {/* Chevron */}
        <span
          className={`shrink-0 text-gray-400 transition-transform duration-200 text-sm ${
            open ? "rotate-180" : ""
          }`}
        >
          {"\u25be"}
        </span>
      </div>

      {/* Expanded editor */}
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          {/* Label */}
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
            />
          </div>

          {/* Type */}
          <TypePicker value={fieldType} onChange={setFieldType} />

          {/* Options for select */}
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
                placeholder="Rush (3\u20135 days), Standard (1\u20132 weeks), Flexible"
              />
              {parseOptions(options) && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {parseOptions(options)!.map((o) => (
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

          {/* Required */}
          <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none w-fit">
            <Toggle checked={required} onChange={() => setRequired((r) => !r)} />
            <span className="text-gray-700 font-medium">Required</span>
          </label>

          {/* Live preview */}
          <FieldPreview
            field_type={fieldType}
            label={label}
            options={options}
            required={required}
          />

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || !label.trim()}
              className={`font-bold px-5 py-2 rounded-xl text-sm transition disabled:opacity-50 ${
                dirty
                  ? "bg-brand-accent text-white hover:bg-red-600"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {saving ? "Saving\u2026" : dirty ? "Save changes" : "Saved \u2713"}
            </button>
            <button
              onClick={handleDiscard}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              {dirty ? "Discard" : "Close"}
            </button>
            <button
              onClick={() => onDelete(field.id)}
              className="ml-auto text-sm text-red-400 hover:text-red-600"
            >
              Delete field
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddFieldPanel({
  onAdd,
}: {
  onAdd: (f: Omit<CustomField, "id" | "sort_order" | "active">) => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState("");
  const [saving, setSaving] = useState(false);
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => labelRef.current?.focus(), 50);
  }, []);

  const handleAdd = async () => {
    if (!label.trim()) return;
    setSaving(true);
    await onAdd({
      label,
      field_type: fieldType,
      required,
      options: fieldType === "select" ? parseOptions(options) : null,
    });
    setSaving(false);
    setLabel("");
    setFieldType("text");
    setRequired(false);
    setOptions("");
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-brand-accent/40 bg-white p-5 space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">New field</p>
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
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
      </div>
      <TypePicker value={fieldType} onChange={setFieldType} />
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
            placeholder="Option A, Option B, Option C"
          />
        </div>
      )}
      <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none w-fit">
        <Toggle checked={required} onChange={() => setRequired((r) => !r)} />
        <span className="text-gray-700 font-medium">Required</span>
      </label>
      <FieldPreview
        field_type={fieldType}
        label={label}
        options={options}
        required={required}
      />
      <button
        onClick={handleAdd}
        disabled={saving || !label.trim()}
        className="w-full bg-brand-accent text-white font-bold py-2.5 rounded-xl text-sm uppercase tracking-widest hover:bg-red-600 transition disabled:opacity-50"
      >
        {saving ? "Adding\u2026" : "Add field"}
      </button>
    </div>
  );
}

export default function FieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    fetch("/api/admin/fields")
      .then((r) => r.json())
      .then((d) => setFields(Array.isArray(d) ? d : []));

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (id: string, patch: Partial<CustomField>) => {
    setError("");
    const existing = fields.find((f) => f.id === id)!;
    const res = await fetch(`/api/admin/fields/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...existing, ...patch }),
    });
    if (!res.ok) setError("Failed to save field");
    else load();
  };

  const handleAdd = async (f: Omit<CustomField, "id" | "sort_order" | "active">) => {
    setError("");
    const res = await fetch("/api/admin/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    if (!res.ok) setError("Failed to add field");
    else {
      setShowAdd(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this field?")) return;
    await fetch(`/api/admin/fields/${id}`, { method: "DELETE" });
    load();
  };

  const handleToggleActive = (field: CustomField) => {
    handleSave(field.id, { active: !field.active });
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-brand">
            Form Fields
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {fields.length} field{fields.length !== 1 ? "s" : ""} &middot; click any field to
            edit
          </p>
        </div>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className={`font-bold px-4 py-2 rounded-xl text-sm uppercase tracking-widest transition ${
            showAdd
              ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
              : "bg-brand-accent text-white hover:bg-red-600"
          }`}
        >
          {showAdd ? "Cancel" : "+ Add Field"}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {showAdd && <AddFieldPanel onAdd={handleAdd} />}

      {fields.length === 0 && !showAdd ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3 font-thin">+</p>
          <p className="font-semibold text-gray-500">No custom fields yet</p>
          <p className="text-sm mt-1">
            Click &ldquo;+ Add Field&rdquo; to add questions to your quote form
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, i) => (
            <FieldCard
              key={field.id}
              field={field}
              index={i}
              total={fields.length}
              onSave={handleSave}
              onDelete={handleDelete}
              onMove={move}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
