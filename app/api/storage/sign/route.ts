import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const ALLOWED_BUCKETS = new Set([
  "portfolio-media",
  "interview-responses",
  "certifications",
]);

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const bucket = String(body.bucket ?? "");
  const filename = String(body.filename ?? "");
  const contentType = String(body.contentType ?? "application/octet-stream");

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: "Bucket not allowed" }, { status: 400 });
  }
  if (!/^[\w.\-]+$/.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
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
