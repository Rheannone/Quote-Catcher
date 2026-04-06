import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav className="bg-white border-b border-gray-200 px-6 py-0 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex gap-0">
          {[
            { href: "/admin", label: "Quotes" },
            { href: "/admin/settings", label: "Appearance" },
            { href: "/admin/fields", label: "Form Fields" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-5 py-4 text-sm font-semibold text-gray-600 hover:text-brand border-b-2 border-transparent hover:border-brand-accent transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
}
