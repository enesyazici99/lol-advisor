import { getLatestVersion } from "@/lib/riot/ddragon";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomeClient } from "@/app/HomeClient";
import { SummonerPageClient } from "./SummonerPageClient";

interface SummonerPageProps {
  params: { region: string; slug: string };
}

/** Parse slug: "GameName-TagLine" → { gameName, tagLine } */
function parseSlug(slug: string): { gameName: string; tagLine: string } {
  const decoded = decodeURIComponent(slug);
  const lastDash = decoded.lastIndexOf("-");
  if (lastDash === -1) {
    return { gameName: decoded, tagLine: "" };
  }
  return {
    gameName: decoded.slice(0, lastDash),
    tagLine: decoded.slice(lastDash + 1),
  };
}

export async function generateMetadata({ params }: SummonerPageProps) {
  const { gameName, tagLine } = parseSlug(params.slug);
  return {
    title: `${gameName}#${tagLine} — LOL Advisor`,
    description: `${gameName}#${tagLine} summoner profile and match history`,
  };
}

export default async function SummonerPage({ params }: SummonerPageProps) {
  const { region, slug } = params;
  const { gameName, tagLine } = parseSlug(slug);

  let version = "";
  try {
    version = await getLatestVersion();
  } catch (err) {
    console.error("Failed to fetch DDragon version:", err);
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <HomeClient version={version} />
      <Header />
      <SummonerPageClient
        gameName={gameName}
        tagLine={tagLine}
        region={region}
        version={version}
      />
      <Footer />
    </div>
  );
}
