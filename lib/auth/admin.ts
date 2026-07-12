import { createClient, createServiceClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  handle: string;
  displayName: string;
}

/**
 * Returns the signed-in user when they hold the admin flag, else null.
 * Admins are promoted manually via SQL (migration 0032) — there is no
 * self-serve path. Callers should notFound() on null so /admin does not
 * reveal its existence to non-admins.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Service role: the flag must be authoritative even if profile RLS changes.
  const service = createServiceClient();
  const { data: profile, error } = await service
    .from("profiles")
    .select("is_admin, handle, display_name")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[admin] getAdminUser", error);
    return null;
  }
  if (!profile?.is_admin) return null;
  return { id: user.id, handle: profile.handle, displayName: profile.display_name };
}
