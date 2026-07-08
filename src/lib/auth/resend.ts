import { Resend } from "resend";
import { copy } from "@/lib/copy";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export function getFromEmail(): string {
  const from = process.env.RESEND_FROM_EMAIL ?? "Ghost <onboarding@resend.dev>";
  if (from.includes("<") && from.includes(">")) {
    return from;
  }
  return `Ghost <${from}>`;
}

export async function sendOtpEmail(
  to: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to,
      subject: copy.email.subject(code),
      html: buildOtpEmailHtml(code),
      text: copy.email.text(code),
    });

    if (error) {
      console.error("[Resend] send failed:", error);
      const hint =
        error.message?.includes("only send testing emails") ||
        error.message?.includes("verify a domain")
          ? " With onboarding@resend.dev you can only send to your Resend account email until you verify a domain."
          : "";
      return { success: false, error: `${error.message}${hint}` };
    }

    console.log(`[Resend] OTP email sent to ${to} (id: ${data?.id ?? "unknown"})`);
    return { success: true };
  } catch (err) {
    console.error("[Resend]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}

function buildOtpEmailHtml(code: string): string {
  const digits = code.split("");
  const digitBoxes = digits
    .map(
      (d) =>
        `<td style="width:48px;height:56px;background:#12121c;border:1px solid rgba(255,255,255,0.1);border-radius:12px;text-align:center;font-size:28px;font-weight:700;color:#fafafa;font-family:monospace;">${d}</td>`
    )
    .join('<td style="width:8px;"></td>');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030308;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030308;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-size:24px;font-weight:700;color:#fafafa;letter-spacing:-0.03em;">${copy.brand.wordmark}</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:8px;">
              <h1 style="margin:0;font-size:22px;font-weight:600;color:#fafafa;">${copy.email.heading}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#a1a1aa;">
                ${copy.email.body}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0"><tr>${digitBoxes}</tr></table>
            </td>
          </tr>
          <tr>
            <td>
              <p style="margin:0;font-size:13px;color:#71717a;">
                ${copy.email.footer}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
