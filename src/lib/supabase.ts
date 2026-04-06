import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a fresh admin client on every call.
 * No singleton — Next.js evaluates module-level code at build time, so a
 * singleton can be initialized with undefined credentials and then reused
 * broken at runtime on Vercel. Client creation is just a JS object, no cost.
 */
export function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export { getSupabaseAdmin as createSupabaseAdmin };

// Browser-safe client (anon key only) — singleton is fine here since it only
// runs in the browser where env vars are always available at runtime.
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


