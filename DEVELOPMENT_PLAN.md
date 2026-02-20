# LOL Advisor — Development Plan

> Son guncelleme: 2026-02-20

---

## GENEL BAKIS

| Faz | Baslik | Durum |
|-----|--------|-------|
| FAZ 0 | Altyapi + Temel Kurulum | TAMAMLANDI |
| FAZ 1 | ProBuilds Explorer (Core MVP) | TAMAMLANDI (veri limitleri haric) |
| FAZ 2 | Summoner Arama + Match History | TAMAMLANDI |
| FAZ 3 | Matchup Build Advisor | TAMAMLANDI |
| FAZ 4 | Canli Mac Entegrasyonu | BASLANMADI |
| FAZ 5 | Polish + Production | BASLANMADI |
| FAZ 6 | Desktop Companion | BASLANMADI |

---

## FAZ 0: Altyapi + Temel Kurulum — TAMAMLANDI

| # | Gorev | Durum |
|---|-------|-------|
| 1 | Next.js 14 projesi (App Router, TS, Tailwind) | DONE |
| 2 | Tema CSS (profesyonel tema, dark/light mode) | DONE |
| 3 | Tailwind config (renk paleti, fontlar, custom utilities) | DONE |
| 4 | Supabase projesi + migration (tum tablolar) | DONE |
| 5 | `lib/supabase/client.ts` ve `server.ts` | DONE |
| 6 | `lib/riot/ddragon.ts` (version, champions, items, runes, spells, URL builders) | DONE |
| 7 | `scripts/seed-champions.ts` (172 champion seeded) | DONE |
| 8 | Temel UI bilesenleri (CyberCard, CyberButton, LoadingSpinner, Tooltip) | DONE |
| 9 | Header + Footer + Layout | DONE |
| 10 | Zustand store (selectedRole, searchQuery, version, theme, expandedMatchId) | DONE |

**Notlar:**
- Tema neon cyberpunk'tan profesyonel temaya gecti (dark/light mode destegi)
- Inter + JetBrains Mono fontlari
- ScanlineOverlay ve GlowText artik kullanilmiyor (geriye uyumluluk icin dosyalar duruyor)

---

## FAZ 1: ProBuilds Explorer — TAMAMLANDI (veri limitleri haric)

### Backend / Scraper

| # | Gorev | Durum | Notlar |
|---|-------|-------|--------|
| 11a | `lib/scraper/probuildstats.ts` temel scraper | DONE | Cheerio ile HTML parse |
| 11b | Aggregate meta data parsing (win rate, items, boots, skill order) | DONE | parseMeta() |
| 11c | Match list parsing (player, KDA, items, runes, spells, vs champion) | DONE | parseMatches() |
| 11d | KDA parser (concatenated ratio fix) | DONE | Matematiksel split yontemi |
| 11e | Match detail scraping (item timeline, skill order per level) | EKSIK | probuildstats match detail sayfasi scrape edilmiyor |
| 11f | CS, Gold, Damage, Duration scraping | EKSIK | Bu veriler scrape edilmiyor, DB'de null |
| 11g | Role detection per match | DONE | DDragon tags + Smite detection ile inferRole() |
| 11h | Rune primary tree parsing | EKSIK | rune_primary_tree hep null, sadece keystone var |
| 11i | Rune secondary slots parsing | EKSIK | Sadece secondary tree ID var, slot detayi yok |
| 11j | Rune shards parsing | EKSIK | Shard bilgisi yok |
| 11k | External ID ile dedup | DONE | matchFingerprint() ile uygulama katmaninda dedup |
| 12a | `/api/cron/scrape-probuilds` cron endpoint | DONE | 172 champion, batch=30 ile |
| 12b | `/api/cron/scrape-meta` meta aggregation cron | DONE | Pro match'lerden aggregate hesapliyor |
| 13 | `scripts/initial-scrape.ts` toplu scrape | DONE | 172 champion, 3440 mac |
| 14 | `/api/builds/pro-matches` endpoint | DONE | Paginated, role/region filtreli |
| 15 | `/api/builds/meta` endpoint | DONE | Champion + role filtreli |

### Frontend

| # | Gorev | Durum | Notlar |
|---|-------|-------|--------|
| 16a | Champion grid (ikonlarla, aranabilir) | DONE | 172 champion, DDragon ikonlari |
| 16b | RoleFilter bileseni | DONE | ALL/TOP/JGL/MID/ADC/SUP |
| 16c | SearchBar (instant filter) | DONE | |
| 17a | BuildSummary bileseni (win rate, items, runes, boots, spells, skill order) | DONE | |
| 17b | Rol tab'lari champion sayfasinda | DONE | |
| 17c | ProMatchList bileseni | DONE | Pagination ile |
| 17d | ProMatchRow bileseni (zaman, pro isim, VS, KDA, runes, spells, items, W/L) | DONE | Win/loss arka plan rengiyle |
| 17e | RuneDisplay | DONE | Keystone ikonu gosterimi |
| 17f | SpellDisplay | DONE | Summoner spell ikonlari |
| 17g | ItemBuildDisplay | DONE | Sirali item ikonlari |
| 17h | SkillOrderDisplay | DONE | Q>W>E gosterimi |
| 17i | ProPlayerBadge | DONE | Isim (accent) + takim + bolge |
| 17j | Region filtresi (dropdown) | DONE | Champion sayfasinda select dropdown |
| 17k | OTP toggle | EKSIK | Veri yok, filtre yok |
| 18a | Mac detay — accordion (ExpandedMatchDetail) | DONE | Inline expand, ayri sayfa yok |
| 18b | MatchStats (KDA, CS, Gold, Damage, Duration) | DONE | Sadece mevcut verileri gosteriyor (null olanlar gizli) |
| 18c | ItemTimeline bileseni | DONE | Bilesen hazir ama veri yok, veri yoksa gizleniyor |
| 18d | SkillTimeline bileseni | DONE | Meta skill_order fallback gosteriyor, veri yoksa gizleniyor |
| 18e | Ayri mac detay sayfasi (`/match/[matchId]`) | EKSIK | Yok, accordion ile inline gosterim var |
| 19 | Loading states, error states, empty states | DONE | |
| 20 | Framer Motion animasyonlari | DONE | Page transitions, list animations |

### Testler

| Tur | Sayi | Durum |
|-----|------|-------|
| Vitest (unit + component) | 69 | DONE |
| Playwright (E2E) | 17 | DONE |
| Toplam | 86 | HEPSI GECIYOR |

---

## FAZ 1 EKSIK ISLER — Oncelik Sirasi

### Tamamlanan Eksikler

| # | Gorev | Durum |
|---|-------|-------|
| E1 | Cron job'u tum champion'lari kapsasin | DONE — Batch=30, 172 champion |
| E2 | Duplicate match onleme | DONE — matchFingerprint() ile app-level dedup |
| E3 | Role detection | DONE — inferRole() (DDragon tags + Smite) |
| E4 | MatchStats cleanup | DONE — Null alanlar gizleniyor |
| E5/E6 | Skill order from meta | DONE — Meta skill_order fallback |
| E8 | Region filtresi UI | DONE — Select dropdown |

### Hala Eksik (probuildstats veri limitleri)

| # | Gorev | Aciklama |
|---|-------|----------|
| E4b | CS/Gold/Damage/Duration | probuildstats bu verileri sunmuyor — alternatif kaynak gerekli |
| E5b | Item Timeline per match | probuildstats match detail sayfasi yok — Riot API ile cekilebilir |
| E6b | Skill Order per match | probuildstats match bazinda skill order yok — Riot API ile cekilebilir |
| E7 | Rune tam detay | Primary tree, secondary slots, shards bilgileri |
| E9 | Popular Spells meta | Meta scraper spell data'yi tam topluyor ama UI'da gosterilmiyor |

### Dusuk Oncelik

| # | Gorev | Aciklama |
|---|-------|----------|
| E10 | OTP filtresi | One-Trick-Pony toggle (veri toplama + UI) |
| E11 | Ayri mac detay sayfasi | `/match/[matchId]` route (simdilik accordion var) |
| E12 | Rol dagilimi gosterimi | BuildSummary'de "%97 ADC, %3 MID" gibi rol dagilimi |
| E13 | Son eklenen maclar ana sayfada | Ana sayfada karisik champion son 10 pro mac |

---

## FAZ 2: Summoner Arama + Match History — TAMAMLANDI

| # | Gorev | Durum | Notlar |
|---|-------|-------|--------|
| 21 | `/api/riot/account` endpoint | DONE | gameName#tagLine -> PUUID + summoner profile |
| 22 | `/api/riot/matches` endpoint | DONE | Match history with pagination |
| 23 | `/api/riot/match/[matchId]` endpoint | DONE | Detayli mac verisi + timeline |
| 24 | `lib/riot/api.ts` rate limiter | DONE | Sliding window (20/1s, 100/120s) |
| 25 | `lib/riot/transforms.ts` | DONE | normalizePosition, transformMatch, transformTimeline, transformMatchDetail |
| 26 | `hooks/useSummoner.ts` | DONE | useSummonerAccount, useMatchHistory, useMatchDetail (SWR) |
| 27 | `/summoner/[region]/[slug]` sayfasi | DONE | Server component + SummonerPageClient |
| 28 | Summoner profil karti | DONE | Level, ikon, isim#tag |
| 29 | Match history listesi | DONE | Champion, KDA, items, runes, spells, W/L, tarih |
| 30 | Match detail expand | DONE | Tum katilimcilar, item timeline, skill order |
| 31 | Region secimi | DONE | SEARCH_REGIONS dropdown |

---

## FAZ 3: Matchup Build Advisor — TAMAMLANDI

### Backend

| # | Gorev | Durum | Notlar |
|---|-------|-------|--------|
| 32 | `lib/scraper/lolalytics.ts` | DONE | Cheerio scraper: scrapeCounters + scrapeBuild |
| 33 | `lib/engine/champion-tags.ts` | DONE | 100+ champion elle zenginlestirilmis tag mapping |
| 34 | `lib/engine/scoring.ts` | DONE | calculateTierScore (0.6/0.25/0.15), getCounterPicks, getWeakPicks |
| 35 | `lib/engine/recommendation.ts` | DONE | getMatchupBuild (matchup-specific + meta fallback) |
| 36 | `/api/cron/scrape-matchups/route.ts` | DONE | Batch 30 champion, 5 rol, upsert matchup_data |
| 37 | `/api/cron/compute-tags/route.ts` | DONE | DDragon + CHAMPION_TAG_MAP -> champion_tags |
| 38 | `/api/builds/counters/route.ts` | DONE | GET ?champion&role -> bestPicks + worstPicks |
| 39 | `/api/builds/recommend/route.ts` | DONE | GET ?champion&role&vs -> matchupBuild + counterPicks |

### Frontend

| # | Gorev | Durum | Notlar |
|---|-------|-------|--------|
| 40 | `hooks/useAdvisor.ts` | DONE | useCounters, useRecommendation (SWR) |
| 41 | `stores/appStore.ts` guncelleme | DONE | advisorRole, advisorVsChampion state |
| 42 | `components/advisor/RolePicker.tsx` | DONE | 5 rol butonu, auto-detect badge |
| 43 | `components/advisor/ChampionSelect.tsx` | DONE | Searchable champion grid |
| 44 | `components/advisor/CounterList.tsx` | DONE | Strong/Weak Against tabs, tier badges (S+/S/A/B/C) |
| 45 | `components/advisor/MatchupBuild.tsx` | DONE | Items/runes/spells paneli, meta fallback uyarisi |
| 46 | `app/advisor/page.tsx` | DONE | Server component + Suspense |
| 47 | `app/advisor/AdvisorPageClient.tsx` | DONE | Rol/champion secim + sonuclar, summoner auto-detect |
| 48 | Header nav link | DONE | "Advisor" linki |

### Altyapi

| # | Gorev | Durum | Notlar |
|---|-------|-------|--------|
| 49 | `lib/supabase/types.ts` guncelleme | DONE | MatchupData, ChampionTag, PrecomputedScore |
| 50 | `vercel.json` cron ekleme | DONE | scrape-matchups (12h), compute-tags (daily) |
| 51 | Scoring unit testleri | DONE | 15 test (calculateTier, calculateTierScore, scoreMatchup) |

### Testler

| Tur | Sayi | Durum |
|-----|------|-------|
| Vitest (unit + component) | 109 | DONE (94 mevcut + 15 yeni) |
| Playwright (E2E) | 17 | DONE |
| Toplam | 126 | HEPSI GECIYOR |

---

## FAZ 4: Canli Mac Entegrasyonu — BASLANMADI

| # | Gorev | Durum |
|---|-------|-------|
| 52 | Spectator-V5 API entegrasyonu (`lib/riot/api.ts`'e ekle) | EKSIK |
| 53 | `/api/riot/spectator/route.ts` endpoint | EKSIK |
| 54 | `hooks/useLiveGame.ts` (polling hook) | EKSIK |
| 55 | `/live/page.tsx` LiveGame sayfasi | EKSIK |
| 56 | LiveGameDashboard bileseni | EKSIK |
| 57 | Otomatik champion detect + advisor tetikleme | EKSIK |
| 58 | 30 saniye polling | EKSIK |
| 59 | Spectator calismazsa fallback | EKSIK |

---

## FAZ 5: Polish + Production — BASLANMADI

| # | Gorev | Durum |
|---|-------|-------|
| 60 | Responsive design (mobile) | KISMEN (grid responsive ama detaylar degil) |
| 61 | SEO (champion sayfalari icin SSG/ISR) | EKSIK |
| 62 | Vercel cron job konfigurasyonu | DONE (vercel.json hazir) |
| 63 | Production Riot API key basvurusu | EKSIK |
| 64 | Performance optimizasyonu | EKSIK |

---

## FAZ 6: Desktop Companion — BASLANMADI

| # | Gorev | Durum |
|---|-------|-------|
| 65 | Electron/Tauri desktop app | EKSIK |
| 66 | LCU API entegrasyonu | EKSIK |
| 67 | WebSocket -> web app | EKSIK |

---

## MEVCUT DOSYA YAPISI

```
lol-advisor/
├── app/
│   ├── layout.tsx                          # DONE
│   ├── page.tsx                            # DONE
│   ├── globals.css                         # DONE
│   ├── providers.tsx                       # DONE (theme init)
│   ├── HomeClient.tsx                      # DONE
│   ├── champion/[key]/
│   │   ├── page.tsx                        # DONE
│   │   └── ChampionPageClient.tsx          # DONE
│   ├── summoner/[region]/[slug]/
│   │   ├── page.tsx                        # DONE (FAZ 2)
│   │   └── SummonerPageClient.tsx          # DONE (FAZ 2)
│   ├── advisor/
│   │   ├── page.tsx                        # DONE (FAZ 3)
│   │   └── AdvisorPageClient.tsx           # DONE (FAZ 3)
│   └── api/
│       ├── ddragon/version/route.ts        # DONE
│       ├── builds/
│       │   ├── pro-matches/route.ts        # DONE
│       │   ├── meta/route.ts               # DONE
│       │   ├── counters/route.ts           # DONE (FAZ 3)
│       │   └── recommend/route.ts          # DONE (FAZ 3)
│       ├── riot/
│       │   ├── account/route.ts            # DONE (FAZ 2)
│       │   ├── matches/route.ts            # DONE (FAZ 2)
│       │   └── match/[matchId]/route.ts    # DONE (FAZ 2)
│       ├── scraper/trigger/route.ts        # DONE
│       └── cron/
│           ├── scrape-probuilds/route.ts   # DONE
│           ├── scrape-meta/route.ts        # DONE
│           ├── scrape-matchups/route.ts    # DONE (FAZ 3)
│           └── compute-tags/route.ts       # DONE (FAZ 3)
├── components/
│   ├── layout/ (Header, SearchBar, Footer) # DONE
│   ├── champions/ (Grid, Card, RoleFilter) # DONE
│   ├── probuilds/                          # DONE
│   │   ├── ProMatchList.tsx
│   │   ├── ProMatchRow.tsx
│   │   ├── BuildSummary.tsx
│   │   ├── ProPlayerBadge.tsx
│   │   ├── ItemBuildDisplay.tsx
│   │   ├── RuneDisplay.tsx
│   │   ├── SpellDisplay.tsx
│   │   ├── SkillOrderDisplay.tsx
│   │   └── detail/
│   │       ├── ExpandedMatchDetail.tsx
│   │       ├── MatchStats.tsx
│   │       ├── ItemTimeline.tsx
│   │       └── SkillTimeline.tsx
│   ├── summoner/                           # DONE (FAZ 2)
│   │   ├── MatchHistoryRow.tsx
│   │   ├── SummonerProfile.tsx
│   │   └── MatchDetailExpanded.tsx
│   ├── advisor/                            # DONE (FAZ 3)
│   │   ├── RolePicker.tsx
│   │   ├── ChampionSelect.tsx
│   │   ├── CounterList.tsx
│   │   └── MatchupBuild.tsx
│   └── ui/ (CyberCard, CyberButton, etc.) # DONE
├── hooks/
│   ├── useDataDragon.ts                    # DONE
│   ├── useProBuilds.ts                     # DONE
│   ├── useSummoner.ts                      # DONE (FAZ 2)
│   └── useAdvisor.ts                       # DONE (FAZ 3)
├── stores/appStore.ts                      # DONE (FAZ 3 state eklendi)
├── lib/
│   ├── supabase/ (client, server, types)   # DONE (FAZ 3 tipler eklendi)
│   ├── riot/
│   │   ├── ddragon.ts                      # DONE
│   │   ├── api.ts                          # DONE (FAZ 2'de aktif)
│   │   ├── rateLimiter.ts                  # DONE (FAZ 2)
│   │   ├── transforms.ts                   # DONE (FAZ 2)
│   │   ├── types.ts                        # DONE (FAZ 2)
│   │   └── constants.ts                    # DONE
│   ├── scraper/
│   │   ├── probuildstats.ts                # DONE
│   │   └── lolalytics.ts                   # DONE (FAZ 3)
│   ├── engine/                             # DONE (FAZ 3)
│   │   ├── champion-tags.ts
│   │   ├── scoring.ts
│   │   └── recommendation.ts
│   └── utils/ (cache, helpers)             # DONE
├── scripts/
│   ├── seed-champions.ts                   # DONE
│   └── initial-scrape.ts                   # DONE (172 champion)
├── supabase/migrations/001_initial.sql     # DONE (tum tablolar)
├── __tests__/                              # 109 unit/component + 17 e2e = 126 test
├── vercel.json                             # DONE (4 cron job)
├── tailwind.config.ts                      # DONE
├── vitest.config.ts                        # DONE
└── playwright.config.ts                    # DONE
```

---

## VERI DURUMU

| Tablo | Kayit | Durum |
|-------|-------|-------|
| champions | 172 | Tam (DDragon'dan seed edildi) |
| pro_matches | ~3440 | 172 champion x 20 mac (scrape v3) |
| meta_builds | ~172 | Her champion icin aggregate (role=ALL) |
| matchup_data | 0 | Cron job ile dolacak (scrape-matchups her 12 saat) |
| champion_tags | 0 | Cron job ile dolacak (compute-tags gunluk) |
| precomputed_scores | 0 | FAZ 4+ ile dolacak |

---

## SONRAKI ADIM

**FAZ 4 — Canli Mac Entegrasyonu:** Spectator-V5 API ile oyuncunun aktif macini tespit edip, otomatik olarak rakip champion'lari algilayip counter pick + build onerisi sunma. 30 saniye polling ile canli guncelleme.
