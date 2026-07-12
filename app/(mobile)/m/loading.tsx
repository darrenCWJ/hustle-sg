// Group-level fallback for the /m mobile surface.
export default function MobileLoading() {
  return (
    <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="skeleton" style={{ width: 140, height: 24, borderRadius: 8 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 96, borderRadius: 14 }} />
      ))}
    </div>
  );
}
