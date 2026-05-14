export default function DashboardLoading() {
  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "50px 28px 80px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 40 }}>
        <div>
          <div className="skeleton" style={{ width: 120, height: 11, marginBottom: 10 }} />
          <div className="skeleton" style={{ width: 340, height: 48 }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 999 }} />
          <div className="skeleton" style={{ width: 100, height: 40, borderRadius: 999 }} />
          <div className="skeleton" style={{ width: 120, height: 40, borderRadius: 999 }} />
        </div>
      </div>

      {/* KPI tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 36 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 108, borderRadius: 18 }} />
        ))}
      </div>

      {/* Applications + playbook */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, marginBottom: 36 }}>
        <div>
          <div className="skeleton" style={{ width: 180, height: 26, marginBottom: 16 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />
            ))}
          </div>
        </div>
        <div className="skeleton" style={{ height: 220, borderRadius: 22 }} />
      </div>

      {/* Calendar */}
      <div className="skeleton" style={{ height: 360, borderRadius: 22 }} />
    </main>
  );
}
