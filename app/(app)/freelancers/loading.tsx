export default function FreelancersLoading() {
  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      <div style={{ marginBottom: 32 }}>
        <div className="skeleton" style={{ width: 60, height: 11, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: 220, height: 48 }} />
      </div>

      {/* Search + filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <div className="skeleton" style={{ flex: 1, height: 44, borderRadius: 12 }} />
        <div className="skeleton" style={{ width: 120, height: 44, borderRadius: 12 }} />
      </div>

      {/* Profile cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ padding: 20, borderRadius: 18, border: "1px solid var(--color-line)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 999, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: "70%", height: 14, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: "50%", height: 11 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: "100%", height: 11 }} />
            <div className="skeleton" style={{ width: "80%", height: 11 }} />
            <div style={{ display: "flex", gap: 6 }}>
              {[60, 50, 70].map((w, j) => (
                <div key={j} className="skeleton" style={{ width: w, height: 24, borderRadius: 999 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
