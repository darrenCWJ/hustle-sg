import { verify, isValid } from "@govtechsg/opencerts-verify";
import { getData } from "@govtechsg/open-attestation";

export interface OpenCertSummary {
  title: string;
  issuer: string;
  recipientName: string | null;
  issuedOn: string | null;
  checks: {
    documentIntegrity: boolean;
    documentStatus: boolean;
    issuerIdentity: boolean;
  };
}

export type OpenCertResult =
  | { ok: true; summary: OpenCertSummary }
  | { ok: false; error: string; checks?: OpenCertSummary["checks"] };

const VERIFY_TIMEOUT_MS = 30_000;

// `verify` is a builder: configure once, reuse the verifier per call.
// Ethereum mainnet is where OpenCerts document stores live.
const runVerification = verify({ network: "mainnet" });

/**
 * Verify an OpenCerts / OpenAttestation document (Singapore's notarised
 * credential format, opencerts.io). Three independent checks must all pass:
 * the document hash is untampered, it was issued and not revoked, and the
 * issuer's identity resolves (DNS / OpenCerts registry). This is REAL
 * evidence, so a passing document earns the verified badge without the
 * manual review queue.
 */
export async function verifyOpenCertDocument(document: unknown): Promise<OpenCertResult> {
  let fragments: Awaited<ReturnType<typeof runVerification>>;
  try {
    fragments = await Promise.race([
      runVerification(document as never),
      new Promise<never>((_, rejectFn) =>
        setTimeout(() => rejectFn(new Error("verification timed out")), VERIFY_TIMEOUT_MS),
      ),
    ]);
  } catch (err) {
    console.error("[opencerts] verify", err);
    return {
      ok: false,
      error:
        "Could not verify the document right now (verification service unreachable). Try again shortly.",
    };
  }

  const checks = {
    documentIntegrity: isValid(fragments, ["DOCUMENT_INTEGRITY"]),
    documentStatus: isValid(fragments, ["DOCUMENT_STATUS"]),
    issuerIdentity: isValid(fragments, ["ISSUER_IDENTITY"]),
  };

  if (!checks.documentIntegrity || !checks.documentStatus || !checks.issuerIdentity) {
    const failed = [
      !checks.documentIntegrity && "document integrity (file was modified)",
      !checks.documentStatus && "issuance status (not issued or revoked)",
      !checks.issuerIdentity && "issuer identity (issuer not recognised)",
    ]
      .filter(Boolean)
      .join("; ");
    return { ok: false, error: `Verification failed: ${failed}.`, checks };
  }

  // v2 OpenAttestation documents wrap every value as "salt:type:value";
  // getData unwraps them. Field shapes vary by issuer template, so read
  // defensively.
  let data: Record<string, unknown>;
  try {
    data = getData(document as never) as Record<string, unknown>;
  } catch (err) {
    console.error("[opencerts] getData", err);
    return { ok: false, error: "Document verified but its contents could not be read.", checks };
  }

  const issuers = Array.isArray(data.issuers) ? (data.issuers as Array<Record<string, unknown>>) : [];
  const recipient = (data.recipient ?? {}) as Record<string, unknown>;

  return {
    ok: true,
    summary: {
      title: String(data.name ?? "OpenCerts credential").slice(0, 200),
      issuer:
        issuers
          .map((i) => String(i.name ?? ""))
          .filter(Boolean)
          .join(", ")
          .slice(0, 200) || "Unknown issuer",
      recipientName: recipient.name ? String(recipient.name).slice(0, 200) : null,
      issuedOn: typeof data.issuedOn === "string" ? data.issuedOn.slice(0, 10) : null,
      checks,
    },
  };
}
