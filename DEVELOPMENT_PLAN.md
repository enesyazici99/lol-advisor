# LOL Advisor — Development Plan

> Son guncelleme: 2026-02-19

---

## GENEL BAKIS

| Faz | Baslik | Durum |
|-----|--------|-------|
| FAZ 0 | Altyapi + Temel Kurulum | TAMAMLANDI |
| FAZ 1 | ProBuilds Explorer (Core MVP) | TAMAMLANDI (veri limitleri haric) |
| FAZ 2 | Summoner Arama + Match History | BASLANMADI |
| FAZ 3 | Matchup Build Advisor | BASLANMADI |
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
| 18c | ItemTimeline bileseni | DONE | Bileşen hazir ama veri yok, veri yoksa gizleniyor |
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

## FAZ 2: Summoner Arama + Match History — BASLANMADI

Riot API wrapper (`lib/riot/api.ts`) hazir ama kullanilmiyor.

| # | Gorev | Durum | Notlar |
|---|-------|-------|--------|
| 21 | `/api/riot/account` endpoint (gameName#tagLine -> PUUID) | EKSIK | `api.ts`'de fonksiyon var ama route yok |
| 22 | `/api/riot/match-history` endpoint | EKSIK | `api.ts`'de fonksiyon var ama route yok |
| 23 | Summoner arama sayfasi veya ana sayfada arama | EKSIK | |
| 24 | Match history listesi (champion, KDA, build, W/L, tarih) | EKSIK | |
| 25 | Her mac tiklanabilir -> detay | EKSIK | |

**Hazir olan:** `lib/riot/api.ts` — getSummonerByRiotId, getMatchIds, getMatch, getMatchTimeline fonksiyonlari yazilmis.

---

## FAZ 3: Matchup Build Advisor — BASLANMADI

| # | Gorev | Durum |
|---|-------|-------|
| 26 | `lib/scraper/lolalytics.ts` scraper | EKSIK |
| 27 | Matchup data scraping cron job | EKSIK |
| 28a | `lib/engine/team-analyzer.ts` | EKSIK |
| 28b | `lib/engine/scoring.ts` | EKSIK |
| 28c | `lib/engine/recommendation.ts` | EKSIK |
| 28d | `lib/engine/champion-tags.ts` | EKSIK |
| 29 | Pre-computed scores cron job | EKSIK |
| 30 | `/api/builds/recommend` endpoint | EKSIK |
| 31a | Advisor sayfasi (`/advisor`) | EKSIK |
| 31b | ChampionPicker bileseni | EKSIK |
| 31c | TeamBuilder bileseni | EKSIK |
| 31d | BuildRecommendation paneli | EKSIK |
| 31e | MatchupInsight bileseni | EKSIK |

**DB tablolari hazir:** `matchup_data`, `champion_tags`, `precomputed_scores` tablolari migration'da olusturulmus (bos).

---

## FAZ 4: Canli Mac Entegrasyonu — BASLANMADI

| # | Gorev | Durum |
|---|-------|-------|
| 32 | Spectator-V5 API entegrasyonu | EKSIK |
| 33 | LiveGameDashboard sayfasi | EKSIK |
| 34 | Otomatik champion detect + advisor tetikleme | EKSIK |
| 35 | 30 saniye polling | EKSIK |
| 36 | Spectator calismazsa fallback | EKSIK |

---

## FAZ 5: Polish + Production — BASLANMADI

| # | Gorev | Durum |
|---|-------|-------|
| 37 | Responsive design (mobile) | KISMEN (grid responsive ama detaylar degil) |
| 38 | SEO (champion sayfalari icin SSG/ISR) | EKSIK |
| 39 | Vercel cron job konfigurasyonu | DONE (vercel.json hazir) |
| 40 | Production Riot API key basvurusu | EKSIK |
| 41 | Performance optimizasyonu | EKSIK |

---

## FAZ 6: Desktop Companion — BASLANMADI

| # | Gorev | Durum |
|---|-------|-------|
| 42 | Electron/Tauri desktop app | EKSIK |
| 43 | LCU API entegrasyonu | EKSIK |
| 44 | WebSocket -> web app | EKSIK |

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
│   └── api/
│       ├── ddragon/version/route.ts        # DONE
│       ├── builds/
│       │   ├── pro-matches/route.ts        # DONE
│       │   └── meta/route.ts               # DONE
│       ├── scraper/trigger/route.ts        # DONE
│       └── cron/
│           ├── scrape-probuilds/route.ts   # DONE (172 champ, batch=30)
│           └── scrape-meta/route.ts        # DONE
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
│   │       ├── ItemTimeline.tsx            # UI hazir, veri yok
│   │       └── SkillTimeline.tsx           # UI hazir, veri yok
│   └── ui/ (CyberCard, CyberButton, etc.) # DONE
├── hooks/
│   ├── useDataDragon.ts                    # DONE
│   └── useProBuilds.ts                     # DONE
├── stores/appStore.ts                      # DONE
├── lib/
│   ├── supabase/ (client, server, types)   # DONE
│   ├── riot/
│   │   ├── ddragon.ts                      # DONE
│   │   ├── api.ts                          # DONE (kullanilmiyor)
│   │   └── constants.ts                    # DONE
│   ├── scraper/probuildstats.ts            # DONE
│   └── utils/ (cache, helpers)             # DONE
├── scripts/
│   ├── seed-champions.ts                   # DONE
│   └── initial-scrape.ts                   # DONE (172 champion)
├── supabase/migrations/001_initial.sql     # DONE (tum tablolar)
├── __tests__/                              # 86 test, hepsi geciyor
├── vercel.json                             # DONE
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
| matchup_data | 0 | FAZ 3'te doldurulacak |
| champion_tags | 0 | FAZ 3'te doldurulacak |
| precomputed_scores | 0 | FAZ 3'te doldurulacak |

### pro_matches tablosunda NULL olan alanlar
- `role` — yeni scrape'lerde inferRole() ile dolduruluyor (eski kayitlar null olabilir)
- `cs`, `gold`, `damage`, `duration_minutes` — probuildstats bu verileri sunmuyor
- `skill_order` — match bazinda yok, meta skill_order fallback olarak gosteriliyor
- `item_timeline` — match bazinda yok, probuildstats'ta bu detay yok
- `rune_primary_tree` — sadece keystone var, tree ID yok

---

## SONRAKI ADIM ONERISI

FAZ 1 temel islevleri tamamlandi. Siradaki secenekler:

1. **FAZ 2 — Summoner Arama + Match History** (Riot API kullanarak)
2. **E4b/E5b/E6b — Detayli mac verileri** (Riot Match-V5 API ile CS, Gold, Timeline, Skill Order)
3. **FAZ 3 — Matchup Build Advisor** (lolalytics scraper + puanlama motoru)

Riot API entegrasyonu hem FAZ 2 hem detayli veri eksiklerini kapsar.
