import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * SSR-aware Supabase client for Server Components and Route Handlers.
 * Uses the anon key — respects RLS policies.
 * For admin-privileged DB operations, still use getSupabaseAdmin() from supabase.ts.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — mutations handled by middleware
          }
        },
      },
    }
  );
}

/**
 * Returns the authenticated session user, or null.
 */
export async function getSessionUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
