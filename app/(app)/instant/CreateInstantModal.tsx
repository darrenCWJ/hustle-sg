"use client";

import { useState, useEffect, useRef } from "react";
import { createInstantGig } from "@/app/actions/instant";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateInstantModal({ onClose, onCreated }: Props) {
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState<string>("");
  const [lon, setLon] = useState<string>("");
  const [locationText, setLocationText] = useState("");
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setGeoStatus("loading");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLon(pos.coords.longitude.toFixed(6));
          setGeoStatus("ok");
        },
        () => setGeoStatus("denied"),
        { timeout: 6000 },
      );
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setStatus("pending");
    setError(null);

    const fd = new FormData(formRef.current);
    if (lat) fd.set("lat", lat);
    if (lon) fd.set("lon", lon);

    const res = await createInstantGig(fd);
    if (res.ok) {
      setStatus("done");
      setTimeout(onCreated, 800);
    } else {
      setStatus("error");
      setError(res.error ?? "Something went wrong.");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "1px solid var(--color-line)", background: "var(--color-surface)",
    color: "var(--color-ink)", fontSize: 13, fontFamily: "inherit",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
    textTransform: "uppercase", color: "var(--color-ink-soft)",
    display: "block", marginBottom: 5,
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "oklch(0% 0 0 / 0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--color-surface)", borderRadius: 20,
          padding: 28, width: "100%", maxWidth: 480,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 24px 80px oklch(0% 0 0 / 0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: 0, letterSpacing: "-0.02em" }}>
            Post Instant Gig
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-ink-soft)", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {status === "done" ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 6px" }}>Gig posted!</p>
            <p style={{ color: "var(--color-ink-soft)", fontSize: 13 }}>Matched freelancers are being notified.</p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input name="title" required placeholder="e.g. Barista needed — 3h shift" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                required
                rows={3}
                placeholder="What's the task, when, and what skills are needed?"
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Urgency</label>
                <select name="urgency" style={inputStyle}>
                  <option value="now">Need now</option>
                  <option value="today">Today</option>
                  <option value="weekend">Weekend</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select name="category" style={inputStyle}>
                  <option value="f&b">F&B</option>
                  <option value="events">Events</option>
                  <option value="tech">Tech</option>
                  <option value="design">Design</option>
                  <option value="tuition">Tuition</option>
                  <option value="content">Content</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Skills (comma-separated)</label>
              <input name="skills" placeholder="e.g. Barista, Customer service, F&B" style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Budget</label>
                <input name="budget_cents" type="number" min={0} required placeholder="e.g. 15000 (= $150)" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Pay type</label>
                <select name="budget_kind" style={inputStyle}>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                Location
                {geoStatus === "ok" && (
                  <span style={{ color: "var(--color-jade)", marginLeft: 6, textTransform: "none", letterSpacing: 0 }}>
                    · GPS locked
                  </span>
                )}
              </label>
              <input
                name="location"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. Toa Payoh, Remote"
                style={inputStyle}
                required
              />
              {geoStatus === "ok" && (
                <p style={{ fontSize: 11, color: "var(--color-ink-soft)", marginTop: 4 }}>
                  Your coordinates will be attached for distance matching.
                </p>
              )}
              {geoStatus === "denied" && (
                <p style={{ fontSize: 11, color: "var(--color-ink-soft)", marginTop: 4 }}>
                  Location permission denied — distance matching unavailable.
                </p>
              )}
            </div>

            {error && (
              <p style={{ padding: "10px 14px", borderRadius: 10, background: "oklch(60% 0.2 25 / 0.1)", color: "oklch(40% 0.2 25)", fontSize: 13, margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "pending"}
              style={{
                padding: "12px 20px", borderRadius: 999,
                background: status === "pending" ? "var(--color-muted)" : "var(--color-ink)",
                color: "var(--color-surface)", border: "none", cursor: status === "pending" ? "default" : "pointer",
                fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em",
              }}
            >
              {status === "pending" ? "Posting…" : "Post & Notify Freelancers"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
