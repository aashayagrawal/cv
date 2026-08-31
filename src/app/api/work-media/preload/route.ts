import { NextResponse } from "next/server";
import { getWorkMediaPreloadItems } from "@/lib/work-media";

// The manifest only changes when the site is redeployed, so generate it at
// build time instead of invoking a server function for each request.
export const dynamic = "force-static";

export async function GET() {
  try {
    const items = await getWorkMediaPreloadItems();

    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control":
            "public, max-age=300, s-maxage=31536000, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to load work media preload manifest" },
      { status: 500 }
    );
  }
}
