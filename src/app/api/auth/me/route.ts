import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// The session JWT already carries the user's id and email, so this endpoint —
// hit by AuthProvider on every page mount — never needs a DB round-trip.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: { id: session.userId, email: session.email },
  });
}
