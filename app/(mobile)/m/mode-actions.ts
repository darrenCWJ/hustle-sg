"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function switchToWorkerMode() {
  const jar = await cookies();
  jar.set("hustle_mode", "worker", { path: "/m", maxAge: 60 * 60 * 24 * 30 });
  redirect("/m/feed");
}

export async function switchToEmployerMode() {
  const jar = await cookies();
  jar.set("hustle_mode", "employer", { path: "/m", maxAge: 60 * 60 * 24 * 30 });
  redirect("/m/employer/gigs");
}
