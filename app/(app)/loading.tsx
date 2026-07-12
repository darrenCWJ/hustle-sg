// Group-level fallback: any (app) route without its own loading.tsx gets this
// skeleton instead of a blank screen while the RSC payload streams in.
export default function AppLoading() {
  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      <div style={{ marginBottom: 32 }}>
        <div className="skeleton" style={{ width: 90, height: 11, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: 300, height: 44 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 260, borderRadius: 18 }} />
      </div>
    </main>
  );
}
