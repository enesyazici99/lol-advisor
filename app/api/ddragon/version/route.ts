import { NextResponse } from "next/server";
import { getLatestVersion } from "@/lib/riot/ddragon";

export async function GET() {
  try {
    const version = await getLatestVersion();
    return NextResponse.json({ version });
  } catch {
    return NextResponse.json({ error: "Failed to fetch version" }, { status: 500 });
  }
}
