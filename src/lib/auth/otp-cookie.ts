import { createHash } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  getOtpExpiry,
  hashOtp,
  isOtpExpired,
  MAX_ATTEMPTS_PER_HOUR,
  normalizeEmail,
} from "./otp";

const OTP_COOKIE = "ghost-otp-pending";
const RATE_COOKIE = "ghost-otp-rate";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export function userIdFromEmail(email: string): string {
  return createHash("sha256")
    .update(normalizeEmail(email))
    .digest("hex")
    .slice(0, 25);
}

interface PendingOtpPayload {
  email: string;
  codeHash: string;
  expiresAt: string;
}

interface RateLimitPayload {
  email: string;
  requests: number[];
}

async function signPayload(
  payload: Record<string, unknown>,
  expiresAt: Date
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret());
}

async function verifyPayload<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as T;
  } catch {
    return null;
  }
}

export async function isRateLimited(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const cookieStore = await cookies();
  const token = cookieStore.get(RATE_COOKIE)?.value;

  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  let requests: number[] = [];

  if (token) {
    const payload = await verifyPayload<RateLimitPayload>(token);
    if (payload?.email === normalized && Array.isArray(payload.requests)) {
      requests = payload.requests.filter((t) => t > oneHourAgo);
    }
  }

  if (requests.length >= MAX_ATTEMPTS_PER_HOUR) {
    return true;
  }

  requests.push(Date.now());
  const rateToken = await signPayload(
    { email: normalized, requests },
    new Date(Date.now() + 60 * 60 * 1000)
  );

  cookieStore.set(RATE_COOKIE, rateToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return false;
}

export async function storePendingOtp(
  email: string,
  code: string
): Promise<void> {
  const normalized = normalizeEmail(email);
  const expiresAt = getOtpExpiry();
  const token = await signPayload(
    {
      email: normalized,
      codeHash: hashOtp(code),
      expiresAt: expiresAt.toISOString(),
    },
    expiresAt
  );

  const cookieStore = await cookies();
  cookieStore.set(OTP_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
}

export async function verifyPendingOtp(
  email: string,
  code: string
): Promise<{ valid: boolean; reason?: "missing" | "expired" | "incorrect" }> {
  const normalized = normalizeEmail(email);
  const cookieStore = await cookies();
  const token = cookieStore.get(OTP_COOKIE)?.value;

  if (!token) {
    return { valid: false, reason: "missing" };
  }

  const payload = await verifyPayload<PendingOtpPayload>(token);
  if (!payload || payload.email !== normalized) {
    return { valid: false, reason: "missing" };
  }

  const expiresAt = new Date(payload.expiresAt);
  if (isOtpExpired(expiresAt)) {
    cookieStore.delete(OTP_COOKIE);
    return { valid: false, reason: "expired" };
  }

  if (payload.codeHash !== hashOtp(code)) {
    return { valid: false, reason: "incorrect" };
  }

  cookieStore.delete(OTP_COOKIE);
  return { valid: true };
}
