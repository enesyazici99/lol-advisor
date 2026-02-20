import { getLatestVersion, getChampions } from "@/lib/riot/ddragon";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomeClient } from "@/app/HomeClient";
import { ChampionPageClient } from "./ChampionPageClient";

interface ChampionPageProps {
  params: { key: string };
}

export async function generateMetadata({ params }: ChampionPageProps) {
  return {
    title: `${params.key} Pro Builds — LOL Advisor`,
    description: `${params.key} profesyonel oyuncu buildleri ve meta analizi`,
  };
}

export default async function ChampionPage({ params }: ChampionPageProps) {
  const { key } = params;
  let version = "";
  let championName = key;

  try {
    version = await getLatestVersion();
    const champions = await getChampions();
    if (champions[key]) {
      championName = champions[key].name;
    }
  } catch (err) {
    console.error("Failed to fetch DDragon data:", err);
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <HomeClient version={version} />
      <Header />
      <ChampionPageClient championKey={key} championName={championName} />
      <Footer />
    </div>
  );
}
