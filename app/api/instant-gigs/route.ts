import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchTodayInstantGigs } from "@/app/actions/instant";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const gigs = await fetchTodayInstantGigs(user?.id);
  return NextResponse.json(gigs);
}
