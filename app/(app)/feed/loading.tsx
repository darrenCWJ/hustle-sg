export default function FeedLoading() {
  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      <div style={{ marginBottom: 32 }}>
        <div className="skeleton" style={{ width: 80, height: 11, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: 260, height: 48 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        {/* Main feed cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 130, borderRadius: 16 }} />
          ))}
        </div>
        {/* Sidebar */}
        <div>
          <div className="skeleton" style={{ height: 280, borderRadius: 18 }} />
        </div>
      </div>
    </main>
  );
}
