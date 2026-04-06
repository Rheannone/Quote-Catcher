import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">🎨</div>
      <h1 className="text-3xl font-black uppercase tracking-widest text-brand mb-3">
        Quote Request Received!
      </h1>
      <p className="text-gray-500 mb-8">
        Thanks for reaching out. We'll review your request and get back to you
        within 1–3 business days.
      </p>
      <Link
        href="/"
        className="inline-block bg-brand-accent text-white font-bold px-8 py-3 rounded-xl uppercase tracking-widest text-sm hover:bg-red-600 transition"
      >
        Submit Another Request
      </Link>
    </div>
  );
}
