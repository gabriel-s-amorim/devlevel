import { NextResponse } from "next/server";
import { signOut } from "@/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await signOut({ redirect: false });
  } catch {
    // Session may already be cleared
  }
  return NextResponse.json({ ok: true });
}
