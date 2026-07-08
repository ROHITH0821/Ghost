import { db } from "@/lib/db";
import { copy } from "@/lib/copy";
import {
  generateOtp,
  hashOtp,
  getOtpExpiry,
  isOtpExpired,
  normalizeEmail,
  isValidEmail,
  MAX_ATTEMPTS_PER_HOUR,
} from "./otp";
import { sendOtpEmail } from "./resend";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSession,
  type SessionPayload,
} from "./session";

export type { SessionPayload };
export { getSession, clearSessionCookie };

export async function sendLoginOtp(
  email: string
): Promise<{ success: boolean; message: string }> {
  const normalized = normalizeEmail(email);

  if (!isValidEmail(normalized)) {
    return { success: false, message: copy.authApi.invalidEmail };
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await db.otpToken.count({
    where: { email: normalized, createdAt: { gte: oneHourAgo } },
  });

  if (recentCount >= MAX_ATTEMPTS_PER_HOUR) {
    return {
      success: false,
      message: copy.authApi.tooManyRequests,
    };
  }

  await db.otpToken.updateMany({
    where: { email: normalized, used: false },
    data: { used: true },
  });

  const code = generateOtp();
  const codeHash = hashOtp(code);
  const expiresAt = getOtpExpiry();

  let user = await db.user.findUnique({ where: { email: normalized } });

  if (!user) {
    user = await db.user.create({ data: { email: normalized } });
  }

  await db.otpToken.create({
    data: {
      email: normalized,
      codeHash,
      expiresAt,
      userId: user.id,
    },
  });

  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.log(`\n[Ghost Dev] OTP for ${normalized}: ${code}\n`);
      return {
        success: true,
        message: copy.authApi.devModeTerminal(normalized),
      };
    }
    return {
      success: false,
      message: copy.authApi.emailNotConfigured,
    };
  }

  const result = await sendOtpEmail(normalized, code);

  if (!result.success) {
    return {
      success: false,
      message: result.error ?? copy.authApi.emailSendFailed,
    };
  }

  return {
    success: true,
    message: copy.authApi.codeSent(normalized),
  };
}

export async function verifyLoginOtp(
  email: string,
  code: string
): Promise<{ success: boolean; message: string; user?: SessionPayload }> {
  const normalized = normalizeEmail(email);

  if (!isValidEmail(normalized) || !/^\d{6}$/.test(code)) {
    return { success: false, message: copy.authApi.invalidEmailOrCode };
  }

  const token = await db.otpToken.findFirst({
    where: { email: normalized, used: false },
    orderBy: { createdAt: "desc" },
  });

  if (!token) {
    return { success: false, message: copy.authApi.noActiveCode };
  }

  if (isOtpExpired(token.expiresAt)) {
    await db.otpToken.update({ where: { id: token.id }, data: { used: true } });
    return { success: false, message: copy.authApi.codeExpired };
  }

  if (token.codeHash !== hashOtp(code)) {
    return { success: false, message: copy.authApi.incorrectCode };
  }

  await db.otpToken.update({ where: { id: token.id }, data: { used: true } });

  let user = await db.user.findUnique({ where: { email: normalized } });
  if (!user) {
    user = await db.user.create({ data: { email: normalized } });
  }

  const sessionToken = await createSessionToken({
    userId: user.id,
    email: user.email,
  });
  await setSessionCookie(sessionToken);

  return {
    success: true,
    message: copy.authApi.signedIn,
    user: { userId: user.id, email: user.email },
  };
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, createdAt: true },
  });

  return user;
}
