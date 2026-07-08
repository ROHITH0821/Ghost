import { normalizeEmail } from "@/lib/auth/otp";
import { db } from "@/lib/db";

export async function upsertUserByEmail(email: string) {
  const normalized = normalizeEmail(email);
  return db.user.upsert({
    where: { email: normalized },
    create: { email: normalized },
    update: {},
  });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email: normalizeEmail(email) },
  });
}

/** Resolve a DB user id from session data (handles legacy hash-based userIds). */
export async function resolveUserId(email: string): Promise<string> {
  const user = await upsertUserByEmail(email);
  return user.id;
}
