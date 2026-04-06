"use client";

import { useState, useEffect } from "react";

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

type FieldDraft = {
  label: string;
  field_type: FieldType;
  required: boolean;
  options: string; // comma-separated string for editing
};

const BLANK: FieldDraft = {
  label: "",
  field_type: "text",
  required: false,
  options: "",
};

const TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  textarea: "Textarea",
  select: "Dropdown",
  checkbox: "Checkbox",
  number: "Number",
};

function parseOptions(str: string): string[] | null {
  const arr = str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length > 0 ? arr : null;
}

export default function FieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [adding, setAdding] = useState(false);
  const [newField, setNewField] = useState<FieldDraft>(BLANK);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<FieldDraft>(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    fetch("/api/admin/fields")
      .then((r) => r.json())
      .then((data) => setFields(Array.isArray(data) ? data : []));

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!newField.label.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newField.label,
          field_type: newField.field_type,
          required: newField.required,
          options:
            newField.field_type === "select"
              ? parseOptions(newField.options)
              : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to add field");
      setNewField(BLANK);
      setAdding(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (field: CustomField) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/fields/${field.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: editDraft.label,
          field_type: editDraft.field_type,
          required: editDraft.required,
          options:
            editDraft.field_type === "select"
              ? parseOptions(editDraft.options)
              : null,
          active: field.active,
          sort_order: field.sort_order,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setEditId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this field? It will no longer appear on the form."))
      return;
    await fetch(`/api/admin/fields/${id}`, { method: "DELETE" });
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase tracking-widest text-brand">
          Form Fields
        </h1>
        <button
          onClick={() => {
            setAdding(true);
            setNewField(BLANK);
          }}
          className="bg-brand-accent text-white font-bold px-4 py-2 rounded-xl text-sm uppercase tracking-widest hover:bg-red-600 transition"
        >
          + Add Field
        </button>
      </div>

      <p className="text-xs text-gray-400">
        These fields appear at the bottom of the public quote form, after the
        standard fields.
      </p>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Field list */}
      <div className="space-y-3">
        {fields.length === 0 && !adding && (
          <p className="text-gray-400 text-sm">
            No custom fields yet. Click "+ Add Field" to create one.
          </p>
        )}

        {fields.map((f, i) => (
          <div
            key={f.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            {editId === f.id ? (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Editing field
                </p>
                <FieldForm
                  value={editDraft}
                  onChange={setEditDraft}
                  onSave={() => handleEdit(f)}
                  onCancel={() => setEditId(null)}
                  saving={saving}
                />
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-semibold text-brand truncate">
                    {f.label}
                  </span>
                  <span className="shrink-0 text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5">
                    {TYPE_LABELS[f.field_type]}
                  </span>
                  {f.required && (
                    <span className="shrink-0 text-xs text-brand-accent font-semibold">
                      required
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    title="Move up"
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20 px-1.5 py-1 text-xs"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === fields.length - 1}
                    title="Move down"
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20 px-1.5 py-1 text-xs"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => {
                      setEditId(f.id);
                      setEditDraft({
                        label: f.label,
                        field_type: f.field_type,
                        required: f.required,
                        options: f.options?.join(", ") ?? "",
                      });
                    }}
                    className="text-sm text-brand hover:underline ml-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="text-sm text-red-500 hover:underline ml-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-brand-accent/30 p-6 space-y-4">
          <h2 className="text-sm font-bold text-brand uppercase tracking-widest">
            New Field
          </h2>
          <FieldForm
            value={newField}
            onChange={setNewField}
            onSave={handleAdd}
            onCancel={() => setAdding(false)}
            saving={saving}
          />
        </div>
      )}
    </div>
  );
}

/* ── Reusable field form ── */
function FieldForm({
  value,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  value: FieldDraft;
  onChange: (v: FieldDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">
            Label <span className="text-red-500">*</span>
          </label>
          <input
            className="form-input"
            value={value.label}
            onChange={(e) => onChange({ ...value, label: e.target.value })}
            placeholder="e.g. Turnaround time preference"
          />
        </div>
        <div>
          <label className="form-label">Field type</label>
          <select
            className="form-input"
            value={value.field_type}
            onChange={(e) =>
              onChange({ ...value, field_type: e.target.value as FieldType })
            }
          >
            <option value="text">Text (single line)</option>
            <option value="textarea">Textarea (multi-line)</option>
            <option value="select">Dropdown (select)</option>
            <option value="checkbox">Checkbox (yes/no)</option>
            <option value="number">Number</option>
          </select>
        </div>
      </div>

      {value.field_type === "select" && (
        <div>
          <label className="form-label">
            Options{" "}
            <span className="text-gray-400 font-normal">(comma-separated)</span>
          </label>
          <input
            className="form-input"
            value={value.options}
            onChange={(e) => onChange({ ...value, options: e.target.value })}
            placeholder="Rush (3–5 days), Standard (1–2 weeks), Flexible"
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={value.required}
          onChange={(e) => onChange({ ...value, required: e.target.checked })}
          className="accent-brand-accent w-4 h-4"
        />
        Make this field required
      </label>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onSave}
          disabled={saving || !value.label.trim()}
          className="bg-brand-accent text-white font-bold px-6 py-2 rounded-xl text-sm hover:bg-red-600 transition disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="text-gray-400 text-sm hover:text-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
