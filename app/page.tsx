import { getLatestVersion, getChampions } from "@/lib/riot/ddragon";
import { Header } from "@/components/layout/Header";
import { SearchBar } from "@/components/layout/SearchBar";
import { Footer } from "@/components/layout/Footer";
import { RoleFilter } from "@/components/champions/RoleFilter";
import { ChampionGrid } from "@/components/champions/ChampionGrid";
import { HomeClient } from "./HomeClient";

export default async function HomePage() {
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
      <SearchBar />
      <RoleFilter />

      {Object.keys(champions).length > 0 ? (
        <ChampionGrid champions={champions} version={version} />
      ) : (
        <div className="text-center py-16">
          <p className="text-fg-muted text-base">
            Loading champion data... Please check your connection.
          </p>
        </div>
      )}

      <Footer />
    </div>
  );
}
