"use server";

import { parseCertText, isVerifiedIssuer } from "@/lib/ai/cert-parser";

export interface ParseResult {
  issuer: string;
  title: string;
  issued_at: string | null;
  skills: string[];
  kind: string;
  verified: boolean;
  error?: string;
}

export async function parseCertAction(text: string): Promise<ParseResult> {
  try {
    const parsed = await parseCertText(text);
    return {
      ...parsed,
      verified: isVerifiedIssuer(parsed.issuer),
    };
  } catch (err) {
    // Never let a model/parse failure throw out of the server action.
    console.error("[demo] parseCertAction", err);
    return {
      issuer: "",
      title: "",
      issued_at: null,
      skills: [],
      kind: "other",
      verified: false,
      error: "Could not read that certificate text. Try pasting a bit more.",
    };
  }
}
