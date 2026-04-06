import Link from "next/link";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={
        {
          "--brand-color": "#111827",
          "--brand-accent": "#6366f1",
          fontFamily: "'Inter', -apple-system, sans-serif",
        } as React.CSSProperties
      }
    >
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-black text-lg tracking-tight text-gray-900">
            QuoteCatcher
          </span>
          <Link
            href="/admin"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            Sign in →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
            Custom Quote Forms for Print Shops
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight">
            Your form.
            <br />
            <span className="text-indigo-600">Your brand.</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Build a fully branded quote request form for your screen printing
            business in minutes. Customize every field, collect submissions, and
            manage everything from one dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/admin"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl text-base uppercase tracking-widest transition shadow-lg"
            >
              Get started free
            </Link>
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition"
            >
              See how it works ↓
            </a>
          </div>
        </div>
      </main>

      {/* How it works */}
      <section
        id="how-it-works"
        className="bg-gray-50 border-t border-gray-100 px-6 py-20"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-center text-gray-900 uppercase tracking-widest mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Sign in",
                desc: "Log in with Google. Takes 10 seconds.",
              },
              {
                step: "2",
                title: "Build your form",
                desc:
                  "Add, edit, reorder, and brand every field on your quote form.",
              },
              {
                step: "3",
                title: "Share & collect",
                desc:
                  "Share your unique link. Submissions land straight in your dashboard.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto">
                  {step}
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} QuoteCatcher. All rights reserved.
      </footer>
    </div>
  );
}
