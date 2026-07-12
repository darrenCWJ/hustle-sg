/**
 * Centralised environment access.
 *
 * Reading a REQUIRED variable that is missing throws a clear, named error
 * instead of failing deep inside an SDK with an opaque message (or, worse,
 * silently falling back to a placeholder host). Access is lazy — not validated
 * at import — so the landing page still renders on a fresh clone before Supabase
 * is configured, matching the app's existing graceful-degradation behaviour.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Set it in .env.local (see .env.example).`,
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const serverEnv = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get openaiApiKey() {
    return optional("OPENAI_API_KEY");
  },
  get anthropicApiKey() {
    return optional("ANTHROPIC_API_KEY");
  },
  get appUrl() {
    return optional("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";
  },
};

/** True when both public Supabase vars are present (for graceful degradation). */
export function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
