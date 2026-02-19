import { createClient } from "@supabase/supabase-js";

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xryftsrnmcrpjqfcumaa.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function main() {
  console.log("Fetching DDragon version...");
  const versionsRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  const versions: string[] = await versionsRes.json();
  const version = versions[0];
  console.log(`Using version: ${version}`);

  console.log("Fetching champion data...");
  const champRes = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
  );
  const champData = await champRes.json();
  const champions = Object.values(champData.data) as Array<{
    id: string;
    key: string;
    name: string;
    title: string;
    tags: string[];
  }>;

  console.log(`Found ${champions.length} champions`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const roleMapping: Record<string, string[]> = {
    Fighter: ["TOP", "JGL"],
    Tank: ["TOP", "SUP"],
    Mage: ["MID"],
    Assassin: ["MID", "JGL"],
    Marksman: ["ADC"],
    Support: ["SUP"],
  };

  const inserts = champions.map((c) => {
    const roles = [...new Set(c.tags.flatMap((tag) => roleMapping[tag] || []))];
    return {
      riot_key: c.key,
      riot_id: c.id,
      name: c.name,
      title: c.title,
      tags: c.tags,
      roles: roles.length > 0 ? roles : ["MID"],
    };
  });

  console.log("Inserting champions...");
  const { error } = await supabase
    .from("champions")
    .upsert(inserts, { onConflict: "riot_key" });

  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log(`Successfully seeded ${inserts.length} champions`);
  }
}

main().catch(console.error);
