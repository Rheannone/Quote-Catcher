"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export type FieldType =
  | "text" | "email" | "tel" | "url" | "date"
  | "number" | "textarea" | "select" | "radio"
  | "checkbox" | "checkbox_group" | "print_item";

export type CustomField = {
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

const SECTION_ORDER = ["contact", "project", "print", "additional"];

const SECTION_LABELS: Record<string, string> = {
  contact:    "Contact Information",
  project:    "Project Details",
  print:      "Print Specifications",
  additional: "Additional Information",
};

// ── Wrapper with label + error ─────────────────────────────────────────────

function FieldWrapper({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

// ── Print item field (expandable detail block) ─────────────────────────────

const PRINT_LOCATIONS = ["Front", "Back", "Left Sleeve", "Right Sleeve", "Hood", "Other"];

function PrintItemField({
  field,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors,
}: {
  field: CustomField;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
}) {
  const [expanded, setExpanded] = useState(false);
  const key = field.field_key ?? field.id;
  const error: string | undefined = errors[key]?.message;

  return (
    <div className="space-y-3">
      <FieldWrapper label={field.label} required={field.required} error={error}>
        <input
          type="text"
          {...register(key, field.required ? { required: `${field.label} is required` } : {})}
          placeholder={field.placeholder || "e.g. Hoodies, T-Shirts, Sweatpants\u2026"}
          className="form-input"
        />
      </FieldWrapper>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-sm font-semibold text-brand-accent hover:underline flex items-center gap-1 transition"
      >
        {expanded ? "- Hide print details" : "+ Add print details (optional)"}
      </button>

      {expanded && (
        <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50">
          <div>
            <label className="form-label">Product / Style</label>
            <input type="text" {...register(`${key}__product_style`)}
              placeholder="e.g. Gildan 18000, Next Level 6210\u2026" className="form-input" />
          </div>

          <div>
            <label className="form-label">Print Locations</label>
            <div className="flex flex-wrap gap-3 mt-1">
              {PRINT_LOCATIONS.map((loc) => (
                <label key={loc} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" value={loc} {...register(`${key}__locations`)}
                    className="accent-brand-accent w-4 h-4" />
                  {loc}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">No. of ink colors</label>
              <input type="number" {...register(`${key}__ink_color_count`)} min={1}
                placeholder="e.g. 2" className="form-input" />
            </div>
            <div>
              <label className="form-label">Ink color description</label>
              <input type="text" {...register(`${key}__ink_colors`)}
                placeholder="e.g. Black, White" className="form-input" />
            </div>
          </div>

          <div>
            <label className="form-label">Preferred brand / style</label>
            <input type="text" {...register(`${key}__brand`)}
              placeholder="e.g. Gildan, Next Level, no preference" className="form-input" />
          </div>

          <div>
            <label className="form-label">Additional print notes</label>
            <textarea {...register(`${key}__notes`)}
              placeholder="Anything else about this print item?" className="form-input min-h-[60px] resize-y" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Individual field renderer ───────────────────────────────────────────────

function DynamicField({
  field,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors,
}: {
  field: CustomField;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
}) {
  // Print item handled by its own component
  if (field.field_type === "print_item") {
    return <PrintItemField field={field} register={register} errors={errors} />;
  }

  const key = field.field_key ?? field.id;
  const error: string | undefined = errors[key]?.message;
  const validationRules = field.required
    ? { required: `${field.label} is required` }
    : {};
  const placeholder = field.placeholder ?? "";
  const opts = field.options ?? [];

  // Single checkbox
  if (field.field_type === "checkbox") {
    return (
      <div>
        <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            {...register(key)}
            className="accent-brand-accent w-4 h-4"
          />
          <span className="font-semibold text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
        </label>
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  }

  // Radio buttons
  if (field.field_type === "radio") {
    return (
      <FieldWrapper label={field.label} required={field.required} error={error}>
        <div className="flex flex-wrap gap-5 mt-1">
          {opts.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                value={opt}
                {...register(key, validationRules)}
                className="accent-brand-accent"
              />
              {opt}
            </label>
          ))}
        </div>
      </FieldWrapper>
    );
  }

  // Checkbox group (multi-select)
  if (field.field_type === "checkbox_group") {
    return (
      <FieldWrapper label={field.label} required={field.required} error={error}>
        <div className="flex flex-wrap gap-4 mt-1">
          {opts.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                value={opt}
                {...register(key, validationRules)}
                className="accent-brand-accent w-4 h-4"
              />
              {opt}
            </label>
          ))}
        </div>
      </FieldWrapper>
    );
  }

  // Dropdown
  if (field.field_type === "select") {
    return (
      <FieldWrapper label={field.label} required={field.required} error={error}>
        <select {...register(key, validationRules)} className="form-input">
          <option value="">Select…</option>
          {opts.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </FieldWrapper>
    );
  }

  // Textarea
  if (field.field_type === "textarea") {
    return (
      <FieldWrapper label={field.label} required={field.required} error={error}>
        <textarea
          {...register(key, validationRules)}
          placeholder={placeholder}
          className="form-input min-h-[80px] resize-y"
        />
      </FieldWrapper>
    );
  }

  // All text-based inputs (text, email, tel, url, date, number)
  const inputType =
    field.field_type === "number" ? "number"
    : field.field_type === "date"  ? "date"
    : field.field_type === "email" ? "email"
    : field.field_type === "tel"   ? "tel"
    : field.field_type === "url"   ? "url"
    : "text";

  return (
    <FieldWrapper label={field.label} required={field.required} error={error}>
      <input
        type={inputType}
        {...register(key, {
          ...validationRules,
          ...(field.field_type === "email"
            ? { pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } }
            : {}),
          ...(field.field_type === "number"
            ? { min: { value: 1, message: "Must be at least 1" } }
            : {}),
        })}
        placeholder={placeholder}
        className="form-input"
      />
    </FieldWrapper>
  );
}

// ── Main form ──────────────────────────────────────────────────────────────

export default function QuoteForm({
  fields,
  formOwnerId,
}: {
  fields: CustomField[];
  formOwnerId: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, unknown>>({ defaultValues: {} });

  // Group active fields by section, sorted
  const sections = useMemo(() => {
    const activeFields = fields.filter((f) => f.active);
    const bySection: Record<string, CustomField[]> = {};
    for (const f of activeFields) {
      // Treat null / empty section as "additional"
      const sec = f.section || "additional";
      if (!bySection[sec]) bySection[sec] = [];
      bySection[sec].push(f);
    }
    // Sort each section's fields by sort_order
    for (const s of Object.keys(bySection)) {
      bySection[s].sort((a, b) => a.sort_order - b.sort_order);
    }
    // Order sections: known first, then any custom sections
    const allSections = [
      ...SECTION_ORDER.filter((s) => bySection[s]),
      ...Object.keys(bySection).filter((s) => !SECTION_ORDER.includes(s)),
    ];
    return allSections.map((s) => ({ key: s, label: SECTION_LABELS[s] ?? s, fields: bySection[s] }));
  }, [fields]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/submit-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldData: data, formOwnerId }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Submission failed");
      }
      router.push("/success");
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {sections.map(({ key, label, fields: sectionFields }) => (
        <section key={key} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <h2 className="section-heading">{label}</h2>
          {sectionFields.map((field) => (
            <DynamicField
              key={field.id}
              field={field}
              register={register}
              errors={errors}
            />
          ))}
        </section>
      ))}

      {serverError && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand-accent hover:bg-red-600 text-white font-bold py-4 rounded-2xl text-lg uppercase tracking-widest transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
      >
        {submitting ? "Submitting…" : "Submit Quote Request"}
      </button>
    </form>
  );
}
