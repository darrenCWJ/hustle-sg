"use client";

import { useRef, useState } from "react";
import { suggestSkills } from "./actions";

export function SkillsSuggestor({ initialSkills = [] }: { initialSkills?: string[] }) {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function getFormValues() {
    const form = containerRef.current?.closest("form");
    const title = ((form?.querySelector("[name=title]") as HTMLInputElement)?.value ?? "").trim();
    const description = ((form?.querySelector("[name=description]") as HTMLTextAreaElement)?.value ?? "").trim();
    return { title, description };
  }

  async function handleSuggest() {
    const { title, description } = getFormValues();
    if (!title && !description) return;
    setLoading(true);
    try {
      const result = await suggestSkills(title, description);
      setSuggestions(result);
    } finally {
      setLoading(false);
    }
  }

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const vals = e.target.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setSkills(vals);
    setSuggestions([]);
  }

  return (
    <div ref={containerRef} className="md:col-span-2" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          name="skills_required"
          value={skills.join(", ")}
          onChange={handleInputChange}
          placeholder="Skills required (comma separated)"
          className="flex-1 rounded-xl border border-line px-4 py-3 bg-surface-raised"
          style={{ minWidth: 0 }}
        />
        <button
          type="button"
          onClick={handleSuggest}
          disabled={loading}
          style={{
            flexShrink: 0,
            padding: "0 18px",
            borderRadius: 999,
            border: "1px solid var(--color-line)",
            background: loading ? "var(--color-muted)" : "var(--color-surface-raised)",
            color: loading ? "var(--color-ink-mute)" : "var(--color-ink)",
            fontSize: 13,
            fontWeight: 700,
            cursor: loading ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            transition: "background 0.12s",
            height: "100%",
          }}
        >
          {loading ? (
            <>
              <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>✦</span>
              Thinking…
            </>
          ) : (
            <>✦ Suggest</>
          )}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-ink-mute)",
              margin: "0 0 8px",
              fontWeight: 600,
            }}
          >
            AI suggestions — tap to add
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {suggestions.map((s) => {
              const selected = skills.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  style={{
                    padding: "5px 13px",
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: 600,
                    border: "1px solid",
                    borderColor: selected ? "var(--color-ink)" : "var(--color-line)",
                    background: selected ? "var(--color-ink)" : "transparent",
                    color: selected ? "var(--color-surface)" : "var(--color-ink-soft)",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                >
                  {selected ? "✓ " : "+ "}{s}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
