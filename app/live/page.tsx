import { Suspense } from "react";
import { getLatestVersion, getChampions } from "@/lib/riot/ddragon";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomeClient } from "@/app/HomeClient";
import { LivePageClient } from "./LivePageClient";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Live Game — LOL Advisor",
  description: "Canli mac takibi ve takim analizi",
};

export default async function LivePage() {
  let version = "";
  let champions: Record<string, import("@/lib/riot/ddragon").DDragonChampion> = {};

  try {
    version = await getLatestVersion();
    champions = await getChampions();
  } catch (err) {
    console.error("Failed to fetch DDragon data:", err);
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      <HomeClient version={version} />
      <Header />
      <Suspense fallback={<LoadingSpinner />}>
        <LivePageClient champions={champions} version={version} />
      </Suspense>
      <Footer />
    </div>
  );
}
