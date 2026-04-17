import OpenAI from "openai";

const MODEL = "text-embedding-3-small";
const DIMS = 1536;

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not set");
    }
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function generateEmbedding(
  text: string,
  { retries = 2 }: { retries?: number } = {},
): Promise<number[]> {
  const trimmed = text.trim().slice(0, 8000);
  if (!trimmed) return new Array(DIMS).fill(0);

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await getClient().embeddings.create({
        model: MODEL,
        input: trimmed,
      });
      const v = res.data[0]?.embedding;
      if (!v || v.length !== DIMS) {
        throw new Error(`Unexpected embedding dimension: ${v?.length}`);
      }
      return v;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Embedding failed");
}

export function buildProfileEmbeddingText({
  headline,
  bio,
  certTitles,
  extractedSkills,
  portfolioTags,
  portfolioDescriptions,
}: {
  headline?: string | null;
  bio?: string | null;
  certTitles?: string[];
  extractedSkills?: string[];
  portfolioTags?: string[];
  portfolioDescriptions?: string[];
}): string {
  return [
    headline,
    bio,
    (certTitles ?? []).join(", "),
    (extractedSkills ?? []).join(", "),
    (portfolioTags ?? []).join(", "),
    (portfolioDescriptions ?? []).join(" · "),
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildGigEmbeddingText({
  title,
  description,
  skills,
  category,
}: {
  title: string;
  description: string;
  skills?: string[];
  category?: string | null;
}): string {
  return [title, description, (skills ?? []).join(", "), category ?? ""]
    .filter(Boolean)
    .join("\n");
}

export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}
