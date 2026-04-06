"use client";

import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Suspense } from "react";

function LoginCard() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleGoogleSignIn = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black uppercase tracking-widest text-brand">
            Latziyela Prints
          </h1>
          <p className="text-sm text-gray-500 mt-1">Admin Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5">
          <h2 className="text-lg font-bold text-gray-800 text-center">
            Sign in to continue
          </h2>

          {error === "unauthorized" && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm text-center">
              Your Google account is not authorized to access this admin.
            </div>
          )}
          {error === "auth_failed" && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm text-center">
              Sign-in failed. Please try again.
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
              />
              <path
                fill="#34A853"
                d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
              />
              <path
                fill="#FBBC05"
                d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"
              />
              <path
                fill="#EA4335"
                d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-gray-400 text-center">
            Only authorized accounts can access the admin portal.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginCard />
    </Suspense>
  );
}
