import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth/admin";
import { setAdminByHandle } from "./actions";

export default async function AdminSettingsPage() {
  const me = await getAdminUser();
  const service = createServiceClient();
  const { data: admins } = await service
    .from("profiles")
    .select("id, handle, display_name, created_at")
    .eq("is_admin", true)
    .order("created_at");

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
        Settings
      </h1>
      <p style={{ margin: "0 0 28px", fontSize: 13.5, color: "var(--color-ink-soft)", maxWidth: 640 }}>
        Everything here is point-and-click — no SQL required. Fraud-model
        tuning lives on the <Link href="/admin/fraud" style={{ color: "var(--color-ink)", fontWeight: 600 }}>Fraud page</Link> next
        to the numbers it affects.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Administrators
        </h2>
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "var(--color-ink-soft)" }}>
          Admins can triage reports, verify credentials, resolve disputes, and
          manage the fraud model. You can&apos;t revoke yourself.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {(admins ?? []).map((a) => (
            <div
              key={a.id}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface-raised)" }}
            >
              <span style={{ fontWeight: 700, fontSize: 14 }}>{a.display_name}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-soft)" }}>@{a.handle}</span>
              {a.id === me?.id && (
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "var(--color-accent-soft)", color: "var(--color-accent-ink)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  you
                </span>
              )}
              <span style={{ marginLeft: "auto" }}>
                {a.id !== me?.id && (
                  <form
                    action={async () => {
                      "use server";
                      await setAdminByHandle(a.handle, false);
                    }}
                    style={{ margin: 0 }}
                  >
                    <button type="submit" className="text-xs px-3 py-1.5 rounded-pill border border-line text-ink-soft hover:border-ink hover:text-ink transition">
                      Revoke
                    </button>
                  </form>
                )}
              </span>
            </div>
          ))}
        </div>

        <form
          action={async (formData: FormData) => {
            "use server";
            await setAdminByHandle(String(formData.get("handle") ?? ""), true);
          }}
          style={{ display: "flex", gap: 8, alignItems: "center", maxWidth: 420 }}
        >
          <label htmlFor="promote-handle" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            Handle to promote
          </label>
          <input
            id="promote-handle"
            name="handle"
            placeholder="handle to promote (without @)"
            style={{ flex: 1, padding: "9px 14px", borderRadius: 999, border: "1px solid var(--color-line)", background: "var(--color-surface)", color: "var(--color-ink)", fontSize: 13 }}
          />
          <button type="submit" className="text-xs px-4 py-2 rounded-pill bg-ink text-surface font-semibold hover:bg-accent-ink transition">
            Make admin
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Operations that still need the Supabase dashboard
        </h2>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--color-ink-soft)", lineHeight: 1.9 }}>
          <li>Enable leaked-password protection (Auth → Security)</li>
          <li>Custom SMTP for email-OTP login in production (Auth → Email)</li>
          <li>Bootstrapping the very first admin (one SQL statement — see SECURITY.md)</li>
        </ul>
      </section>
    </>
  );
}
