import { Suspense } from "react";
import { getLatestVersion, getChampions } from "@/lib/riot/ddragon";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomeClient } from "@/app/HomeClient";
import { AdvisorPageClient } from "./AdvisorPageClient";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Matchup Advisor — LOL Advisor",
  description: "Champion matchup counter pick ve build onerileri",
};

export default async function AdvisorPage() {
  let version = "";
  let champions: Record<string, import("@/lib/riot/ddragon").DDragonChampion> = {};

  try {
    version = await getLatestVersion();
    champions = await getChampions();
  } catch (err) {
    console.error("Failed to fetch DDragon data:", err);
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <HomeClient version={version} />
      <Header />
      <Suspense fallback={<LoadingSpinner />}>
        <AdvisorPageClient champions={champions} version={version} />
      </Suspense>
      <Footer />
    </div>
  );
}
