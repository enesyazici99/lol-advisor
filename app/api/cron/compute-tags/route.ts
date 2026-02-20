import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getChampions } from "@/lib/riot/ddragon";
import { computeChampionTags } from "@/lib/engine/champion-tags";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.nextUrl.searchParams.get("secret");

  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    cronSecret !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const champions = await getChampions();
    const tagMap = computeChampionTags(champions);

    const supabase = createServerClient();
    let upserted = 0;

    for (const [championKey, tags] of Object.entries(tagMap)) {
      const { error } = await supabase
        .from("champion_tags")
        .upsert(
          { champion_key: championKey, tags },
          { onConflict: "champion_key" }
        );

      if (error) {
        console.error(`Tag upsert error for ${championKey}:`, error.message);
      } else {
        upserted++;
      }
    }

    return NextResponse.json({
      success: true,
      championsUpdated: upserted,
      total: Object.keys(tagMap).length,
    });
  } catch (err) {
    console.error("Cron compute-tags error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
