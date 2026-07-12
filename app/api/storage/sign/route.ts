import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isSameOrigin } from "@/lib/security/origin";

// Per-bucket upload rules — the source of truth is the bucket's file_size_limit
// and allowed_mime_types (migration 0025); these give a clean 400 before a
// signed URL is even minted (finding H3).
const BUCKET_RULES: Record<string, { maxBytes: number; mime: RegExp }> = {
  "portfolio-media": { maxBytes: 52_428_800, mime: /^(image|video)\// },
  "interview-responses": { maxBytes: 52_428_800, mime: /^video\// },
  "certifications": { maxBytes: 10_485_760, mime: /^(application\/pdf|image\/)/ },
};

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;
  const bucket = String(b.bucket ?? "");
  const filename = String(b.filename ?? "");
  const contentType = String(b.contentType ?? "application/octet-stream");
  const size = Number(b.size ?? 0);

  const rule = BUCKET_RULES[bucket];
  if (!rule) {
    return NextResponse.json({ error: "Bucket not allowed" }, { status: 400 });
  }
  if (!/^[\w.\-]+$/.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }
  if (!rule.mime.test(contentType)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (Number.isFinite(size) && size > rule.maxBytes) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const objectPath = `${user.id}/${Date.now()}-${filename}`;
  const admin = createServiceClient();
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUploadUrl(objectPath);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const isPublic = bucket === "portfolio-media";
  const publicUrl = isPublic
    ? admin.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl
    : null;

  return NextResponse.json({
    uploadUrl: data.signedUrl,
    token: data.token,
    path: objectPath,
    publicUrl,
    contentType,
  });
}
