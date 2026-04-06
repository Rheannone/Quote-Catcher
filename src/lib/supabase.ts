import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a fresh admin client on every call, with Next.js fetch cache disabled.
 * Next.js 14 App Router overrides global `fetch` and caches GET requests by default.
 * Supabase uses fetch under the hood, so without `cache: 'no-store'` the filtered
 * query responses get served stale even after a DB write.
 */
export function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        fetch: (url, options = {}) =>
          fetch(url, { ...options, cache: "no-store" }),
      },
    }
  );
}

export { getSupabaseAdmin as createSupabaseAdmin };

// Browser-safe client (anon key only) — no cache override needed in the browser.
let _client: SupabaseClient | null = null;
export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}



