import QuoteForm from "@/components/QuoteForm";

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black uppercase tracking-widest text-brand mb-2">
          Request a Quote
        </h1>
        <p className="text-gray-500 text-sm max-w-xl mx-auto">
          Fill out the form below and we'll get back to you within 1–3 business
          days. Please have your artwork and order details ready.
        </p>
      </div>
      <QuoteForm />
    </div>
  );
}
