export default function GigsLoading() {
  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="skeleton" style={{ width: 90, height: 11, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: 280, height: 48 }} />
      </div>

      {/* Filters bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        {[100, 80, 90, 70, 110].map((w, i) => (
          <div key={i} className="skeleton" style={{ width: w, height: 36, borderRadius: 999 }} />
        ))}
      </div>

      {/* Gig cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />
        ))}
      </div>
    </main>
  );
}
