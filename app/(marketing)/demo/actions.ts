"use server";

import { parseCertText, isVerifiedIssuer } from "@/lib/ai/cert-parser";

export interface ParseResult {
  issuer: string;
  title: string;
  issued_at: string | null;
  skills: string[];
  kind: string;
  verified: boolean;
}

export async function parseCertAction(text: string): Promise<ParseResult> {
  const parsed = await parseCertText(text);
  return {
    ...parsed,
    verified: isVerifiedIssuer(parsed.issuer),
  };
}
