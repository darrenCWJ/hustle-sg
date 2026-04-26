import { Avatar } from "@/components/ui/primitives";

function Testimonial({
  quote,
  name,
  role,
  hue = 38,
  featured = false,
  meta,
}: {
  quote: string;
  name: string;
  role: string;
  hue?: number;
  featured?: boolean;
  meta?: { earned: string; period: string };
}) {
  return (
    <figure
      className="testimonial"
      style={{
        margin: 0,
        padding: featured ? 34 : 26,
        borderRadius: 22,
        background: featured ? "var(--color-surface-raised)" : "transparent",
        border: featured ? "1px solid var(--color-line)" : "1px solid var(--color-line-soft)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 20,
        minHeight: 280,
      }}
    >
      <blockquote style={{
        margin: 0,
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: featured ? 26 : 19,
        lineHeight: 1.25,
        letterSpacing: "-0.02em",
      }}>
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar name={name} hue={hue} size={44} verified />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{name}</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--color-ink-soft)" }}>{role}</p>
        </div>
        {meta && (
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>{meta.earned}</p>
            <p style={{ margin: 0, fontSize: 10.5, color: "var(--color-ink-soft)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{meta.period}</p>
          </div>
        )}
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 20 }}>
      <Testimonial
        featured
        quote="I stopped sending portfolio PDFs. Employers watch my 90-second video, see the Singpass tick, and just message. Three months in, I quit my agency job."
        name="Arif R."
        role="Product designer · Tampines"
        meta={{ earned: "S$18,400", period: "last 90 days" }}
        hue={38}
      />
      <Testimonial
        quote="The WSQ cert verification was the deal-breaker. Parents don't trust random Carousell tutors anymore — they trust the blue tick."
        name="Priya N."
        role="Tuition · Pasir Ris"
        hue={340}
      />
      <Testimonial
        quote="Completed three assignments, got the feedback I needed, and the platform walked me through registering my Pte Ltd. Stripe was live by week six."
        name="Wei Jie T."
        role="Now: founder, Muezza Studio"
        hue={165}
      />
    </div>
  );
}
