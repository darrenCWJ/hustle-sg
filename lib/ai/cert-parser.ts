import Anthropic from "@anthropic-ai/sdk";

export interface ParsedCert {
  issuer: string;
  title: string;
  issued_at: string | null; // ISO date
  skills: string[];
  kind: "wsq" | "university" | "accreditation" | "other";
}

const VERIFIED_ISSUERS = new Set<string>([
  "skillsfuture sg",
  "skillsfuture singapore",
  "ssg",
  "workforce singapore",
  "wsg",
  "nus",
  "national university of singapore",
  "ntu",
  "nanyang technological university",
  "smu",
  "singapore management university",
  "sit",
  "singapore institute of technology",
  "sutd",
  "suss",
  "np",
  "ngee ann polytechnic",
  "tp",
  "temasek polytechnic",
  "sp",
  "singapore polytechnic",
  "rp",
  "republic polytechnic",
  "nyp",
  "ies",
  "institution of engineers singapore",
  "scs",
  "singapore computer society",
  "acsm",
  "isaca singapore",
  "isc2 singapore",
]);

export function isVerifiedIssuer(issuer: string): boolean {
  return VERIFIED_ISSUERS.has(issuer.trim().toLowerCase());
}

let client: Anthropic | null = null;
function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY)
      throw new Error("Cert parser is unavailable — ANTHROPIC_API_KEY is not configured on this deployment.");
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `You extract structured data from Singapore freelancer certification documents.
Return strict JSON matching: {"issuer": string, "title": string, "issued_at": string|null (ISO date), "skills": string[] (1-8 concrete skills), "kind": "wsq"|"university"|"accreditation"|"other"}.
Match the issuer name to its common short form (e.g., "National University of Singapore" -> "NUS", "SkillsFuture Singapore" -> "SkillsFuture SG").
Do not invent data not present in the document. Output JSON only, no prose.`;

export async function parseCertText(text: string): Promise<ParsedCert> {
  const trimmed = text.trim().slice(0, 8000);
  if (!trimmed) throw new Error("Empty cert text");

  const res = await getClient().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: trimmed }],
  });

  const blocks = res.content.filter((b) => b.type === "text");
  const raw = blocks.map((b) => ("text" in b ? b.text : "")).join("").trim();
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(`Claude did not return JSON: ${raw.slice(0, 200)}`);
  }
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
  } catch {
    // The model can wrap JSON in prose or emit stray braces; fail with a clear,
    // catchable error instead of an opaque SyntaxError.
    throw new Error(`Claude returned malformed JSON: ${raw.slice(0, 200)}`);
  }

  const kindValue = parsed.kind;
  const kind: ParsedCert["kind"] =
    typeof kindValue === "string" &&
    (["wsq", "university", "accreditation", "other"] as const).includes(
      kindValue as ParsedCert["kind"],
    )
      ? (kindValue as ParsedCert["kind"])
      : "other";

  return {
    issuer: String(parsed.issuer ?? "").trim(),
    title: String(parsed.title ?? "").trim(),
    issued_at: typeof parsed.issued_at === "string" ? parsed.issued_at : null,
    skills: Array.isArray(parsed.skills)
      ? parsed.skills.map((s: unknown) => String(s)).slice(0, 10)
      : [],
    kind,
  };
}
