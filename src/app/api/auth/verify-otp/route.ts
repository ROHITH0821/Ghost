import { NextRequest, NextResponse } from "next/server";
import { verifyLoginOtp } from "@/lib/auth";
import { copy } from "@/lib/copy";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: copy.authApi.invalidEmailOrCode },
        { status: 400 }
      );
    }

    const result = await verifyLoginOtp(email, code);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("[verify-otp]", error);
    return NextResponse.json(
      { success: false, message: copy.authApi.somethingWrong },
      { status: 500 }
    );
  }
}
