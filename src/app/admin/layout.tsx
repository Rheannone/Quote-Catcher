import Link from "next/link";
import { getSessionUser } from "@/lib/supabase-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <div>
      <nav className="bg-white border-b border-gray-200 px-6 py-0 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-0">
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

          {/* Spacer */}
          <div className="flex-1" />

          {/* User info + sign out */}
          {user && (
            <div className="flex items-center gap-3 py-3">
              {user.user_metadata?.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="w-7 h-7 rounded-full"
                />
              )}
              <span className="text-xs text-gray-500 hidden sm:block">
                {user.email}
              </span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-xs text-gray-400 hover:text-red-500 transition font-semibold"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>
      {children}
    </div>
  );
}
