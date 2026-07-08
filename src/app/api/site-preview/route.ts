import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");

  if (!raw) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const target = raw.startsWith("http") ? raw : `https://${raw}`;

  try {
    const res = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(target)}&screenshot=true&meta=false`,
      { signal: AbortSignal.timeout(12000) }
    );

    if (!res.ok) {
      return NextResponse.json({ fallback: true });
    }

    const data = await res.json();
    const imageUrl = data?.data?.screenshot?.url as string | undefined;

    if (!imageUrl) {
      return NextResponse.json({ fallback: true });
    }

    return NextResponse.json({ imageUrl });
  } catch {
    return NextResponse.json({ fallback: true });
  }
}
