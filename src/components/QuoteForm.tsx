"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";

const COLOR_OPTIONS = ["1", "2", "3", "4", "5", "6+"];
const PICKUP_OPTIONS = ["Pick-up", "Shipping"] as const;
const ARTWORK_OPTIONS = ["Yes", "No", "In Progress"] as const;

type FormValues = {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  projectDescription: string;
  deadline: string;
  fulfillment: "Pick-up" | "Shipping";
  shippingCountry: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  whatPrinting: string;
  quantity: string;
  printLocations: string[];
  otherPrintLocation: string;
  colorsFront: string;
  colorsBack: string;
  colorsLeftSleeve: string;
  colorsRightSleeve: string;
  apparelBrand: string;
  hasArtwork: "Yes" | "No" | "In Progress";
  additionalDetails: string;
  custom: Record<string, string | boolean | number>;
};

export type CustomField = {
  id: string;
  label: string;
  field_type: "text" | "textarea" | "select" | "checkbox" | "number";
  required: boolean;
  options: string[] | null;
};

const LOCATION_OPTIONS = [
  { value: "Front", label: "Front" },
  { value: "Back", label: "Back" },
  { value: "Left Sleeve", label: "Left Sleeve" },
  { value: "Right Sleeve", label: "Right Sleeve" },
  { value: "Other", label: "Other (specify below)" },
];

function Field({
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

export default function QuoteForm({
  customFields,
}: {
  customFields: CustomField[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      fulfillment: "Pick-up",
      printLocations: [],
      hasArtwork: "Yes",
      custom: {},
    },
  });

  const fulfillment = useWatch({ control, name: "fulfillment" });
  const printLocations = useWatch({ control, name: "printLocations" }) ?? [];

  const has = (loc: string) => printLocations.includes(loc);

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/submit-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      {/* ── Contact Info ────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <h2 className="section-heading">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="First Name" required error={errors.firstName?.message}>
            <input
              {...register("firstName", { required: "First name is required" })}
              className="form-input"
              placeholder="Jane"
            />
          </Field>
          <Field label="Last Name" required error={errors.lastName?.message}>
            <input
              {...register("lastName", { required: "Last name is required" })}
              className="form-input"
              placeholder="Smith"
            />
          </Field>
        </div>
        <Field label="Band / Company" error={errors.company?.message}>
          <input
            {...register("company")}
            className="form-input"
            placeholder="The Rolling Stones"
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Email Address" required error={errors.email?.message}>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
              })}
              type="email"
              className="form-input"
              placeholder="jane@example.com"
            />
          </Field>
          <Field label="Phone" required error={errors.phone?.message}>
            <input
              {...register("phone", { required: "Phone is required" })}
              type="tel"
              className="form-input"
              placeholder="(412) 555-0100"
            />
          </Field>
        </div>
        <Field label="Website" error={errors.website?.message}>
          <input
            {...register("website")}
            type="url"
            className="form-input"
            placeholder="https://yourband.com"
          />
        </Field>
      </section>

      {/* ── Project Details ──────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <h2 className="section-heading">Project Details</h2>
        <Field label="Project Description" required error={errors.projectDescription?.message}>
          <textarea
            {...register("projectDescription", {
              required: "Please describe your project",
            })}
            className="form-input min-h-[100px] resize-y"
            placeholder="Describe your project, event, or order..."
          />
        </Field>
        <Field label="Deadline" error={errors.deadline?.message}>
          <input
            {...register("deadline")}
            type="date"
            className="form-input"
          />
        </Field>

        {/* Fulfillment */}
        <div>
          <label className="form-label">
            Shipping or Local Pick-up
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="flex gap-6 mt-1">
            {PICKUP_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  {...register("fulfillment", { required: true })}
                  type="radio"
                  value={opt}
                  className="accent-brand-accent"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Shipping Address (conditional) */}
        {fulfillment === "Shipping" && (
          <div className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50">
            <p className="text-sm font-semibold text-gray-600">Shipping Address</p>
            <Field label="Country" error={errors.shippingCountry?.message}>
              <input
                {...register("shippingCountry", {
                  required: fulfillment === "Shipping" ? "Country is required" : false,
                })}
                className="form-input"
                placeholder="United States"
              />
            </Field>
            <Field label="Address Line 1" required error={errors.shippingAddress1?.message}>
              <input
                {...register("shippingAddress1", {
                  required: fulfillment === "Shipping" ? "Address is required" : false,
                })}
                className="form-input"
                placeholder="123 Main St"
              />
            </Field>
            <Field label="Address Line 2" error={errors.shippingAddress2?.message}>
              <input
                {...register("shippingAddress2")}
                className="form-input"
                placeholder="Apt 4B"
              />
            </Field>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="City" required error={errors.shippingCity?.message}>
                <input
                  {...register("shippingCity", {
                    required: fulfillment === "Shipping" ? "City is required" : false,
                  })}
                  className="form-input"
                  placeholder="Pittsburgh"
                />
              </Field>
              <Field label="State" required error={errors.shippingState?.message}>
                <input
                  {...register("shippingState", {
                    required: fulfillment === "Shipping" ? "State is required" : false,
                  })}
                  className="form-input"
                  placeholder="PA"
                />
              </Field>
              <Field label="ZIP Code" required error={errors.shippingZip?.message}>
                <input
                  {...register("shippingZip", {
                    required: fulfillment === "Shipping" ? "ZIP is required" : false,
                  })}
                  className="form-input"
                  placeholder="15210"
                />
              </Field>
            </div>
          </div>
        )}
      </section>

      {/* ── Print Specs ──────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <h2 className="section-heading">Print Specifications</h2>
        <Field label="What are we printing?" required error={errors.whatPrinting?.message}>
          <input
            {...register("whatPrinting", {
              required: "Please specify what you want printed",
            })}
            className="form-input"
            placeholder="T-shirts, hoodies, posters, etc."
          />
        </Field>
        <Field label="How many pieces?" required error={errors.quantity?.message}>
          <input
            {...register("quantity", {
              required: "Quantity is required",
              min: { value: 1, message: "Must be at least 1" },
            })}
            type="number"
            min={1}
            className="form-input"
            placeholder="50"
          />
        </Field>

        {/* Print Locations */}
        <div>
          <label className="form-label">
            Print Locations
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="flex flex-wrap gap-4 mt-1">
            {LOCATION_OPTIONS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  {...register("printLocations", {
                    validate: (v) =>
                      (v && v.length > 0) || "Select at least one location",
                  })}
                  type="checkbox"
                  value={value}
                  className="accent-brand-accent w-4 h-4"
                />
                {label}
              </label>
            ))}
          </div>
          {errors.printLocations && (
            <p className="form-error">{errors.printLocations.message}</p>
          )}
        </div>

        {has("Other") && (
          <Field label="Specify additional print locations" error={errors.otherPrintLocation?.message}>
            <input
              {...register("otherPrintLocation")}
              className="form-input"
              placeholder="e.g. Right chest, hat brim..."
            />
          </Field>
        )}

        {/* Color counts per location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ColorSelect
            label="Colors — Front"
            show={has("Front")}
            field="colorsFront"
            register={register}
            error={errors.colorsFront?.message}
          />
          <ColorSelect
            label="Colors — Back"
            show={has("Back")}
            field="colorsBack"
            register={register}
            error={errors.colorsBack?.message}
          />
          <ColorSelect
            label="Colors — Left Sleeve"
            show={has("Left Sleeve")}
            field="colorsLeftSleeve"
            register={register}
            error={errors.colorsLeftSleeve?.message}
          />
          <ColorSelect
            label="Colors — Right Sleeve"
            show={has("Right Sleeve")}
            field="colorsRightSleeve"
            register={register}
            error={errors.colorsRightSleeve?.message}
          />
        </div>

        <Field label="Preferred apparel brand" required error={errors.apparelBrand?.message}>
          <input
            {...register("apparelBrand", {
              required: "Apparel brand is required (type 'No preference' if flexible)",
            })}
            className="form-input"
            placeholder="Gildan, Comfort Colors, Bella+Canvas, No preference..."
          />
        </Field>

        {/* Artwork */}
        <div>
          <label className="form-label">
            Do you have print-ready artwork?
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="flex gap-6 mt-1">
            {ARTWORK_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  {...register("hasArtwork", { required: true })}
                  type="radio"
                  value={opt}
                  className="accent-brand-accent"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <Field label="Additional details or questions" error={errors.additionalDetails?.message}>
          <textarea
            {...register("additionalDetails")}
            className="form-input min-h-[80px] resize-y"
            placeholder="Anything else we should know..."
          />
        </Field>
      </section>

      {/* ── Custom Fields ───────────────────────── */}
      {customFields.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <h2 className="section-heading">Additional Information</h2>
          {customFields.map((field) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const customErrors = (errors as any).custom ?? {};
            const fieldError: string | undefined =
              customErrors[field.id]?.message;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const reg = (opts?: object) => register(`custom.${field.id}` as any, opts);

            if (field.field_type === "checkbox") {
              return (
                <div key={field.id}>
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...reg()}
                      className="accent-brand-accent w-4 h-4"
                    />
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-0.5">*</span>
                    )}
                  </label>
                  {fieldError && (
                    <p className="form-error">{fieldError}</p>
                  )}
                </div>
              );
            }

            const required = field.required
              ? "This field is required"
              : false;

            return (
              <Field
                key={field.id}
                label={field.label}
                required={field.required}
                error={fieldError}
              >
                {field.field_type === "textarea" ? (
                  <textarea
                    {...reg({ required })}
                    className="form-input min-h-[80px] resize-y"
                  />
                ) : field.field_type === "select" ? (
                  <select {...reg({ required })} className="form-input">
                    <option value="">Select…</option>
                    {(field.options ?? []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.field_type === "number" ? "number" : "text"}
                    {...reg({ required })}
                    className="form-input"
                  />
                )}
              </Field>
            );
          })}
        </section>
      )}

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

/* ── Helper: color count select ─────────────────────── */
function ColorSelect({
  label,
  show,
  field,
  register,
  error,
}: {
  label: string;
  show: boolean;
  field: keyof FormValues;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  error?: string;
}) {
  if (!show) return null;
  return (
    <Field label={label} required error={error}>
      <select
        {...register(field, { required: show ? "Required" : false })}
        className="form-input"
      >
        <option value="">Select…</option>
        {COLOR_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c} color{c === "1" ? "" : "s"}
          </option>
        ))}
      </select>
    </Field>
  );
}
