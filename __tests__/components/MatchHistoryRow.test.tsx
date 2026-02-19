import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, onClick, className, ...props }: any) => (
      <div onClick={onClick} className={className} {...props}>{children}</div>
    ),
  },
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

const mockSetSummonerExpandedMatchId = vi.fn();

vi.mock("@/stores/appStore", () => ({
  useAppStore: (selector: any) => {
    const state = {
      version: "14.24.1",
      summonerExpandedMatchId: null,
      setSummonerExpandedMatchId: mockSetSummonerExpandedMatchId,
    };
    return selector(state);
  },
}));

import { MatchHistoryRow } from "@/components/summoner/MatchHistoryRow";
import type { MatchSummary } from "@/lib/riot/types";

const mockMatch: MatchSummary = {
  matchId: "TR1_001",
  gameCreation: Date.now() - 3600000,
  gameDuration: 1800,
  queueId: 420,
  win: true,
  championName: "Ezreal",
  champLevel: 18,
  position: "ADC",
  kills: 12,
  deaths: 3,
  assists: 9,
  cs: 230,
  gold: 16000,
  damage: 32000,
  visionScore: 20,
  items: [3078, 3004, 3158],
  spell1: 4,
  spell2: 7,
  keystoneId: 8010,
  secondaryTreeId: 8300,
  participants: [
    { puuid: "p1", championName: "Ezreal", teamId: 100, summonerName: "Player1" },
    { puuid: "p2", championName: "Thresh", teamId: 100, summonerName: "Player2" },
    { puuid: "p3", championName: "Ahri", teamId: 200, summonerName: "Player3" },
    { puuid: "p4", championName: "LeeSin", teamId: 200, summonerName: "Player4" },
  ],
};

describe("MatchHistoryRow", () => {
  it("renders champion name in alt text", () => {
    render(<MatchHistoryRow match={mockMatch} />);
    const images = screen.getAllByAltText("Ezreal");
    expect(images.length).toBeGreaterThan(0);
  });

  it("renders KDA", () => {
    render(<MatchHistoryRow match={mockMatch} />);
    expect(screen.getByText("12/3/9")).toBeInTheDocument();
  });

  it("renders win background for winning match", () => {
    const { container } = render(<MatchHistoryRow match={mockMatch} />);
    const row = container.firstChild as HTMLElement;
    expect(row.className).toContain("bg-win-bg");
  });

  it("renders loss background for losing match", () => {
    const losingMatch = { ...mockMatch, win: false };
    const { container } = render(<MatchHistoryRow match={losingMatch} />);
    const row = container.firstChild as HTMLElement;
    expect(row.className).toContain("bg-loss-bg");
  });

  it("renders position", () => {
    render(<MatchHistoryRow match={mockMatch} />);
    expect(screen.getByText("ADC")).toBeInTheDocument();
  });

  it("calls setSummonerExpandedMatchId on click", () => {
    render(<MatchHistoryRow match={mockMatch} />);
    const clickable = screen.getByText("12/3/9").closest("[class*='cursor-pointer']");
    if (clickable) fireEvent.click(clickable);
    expect(mockSetSummonerExpandedMatchId).toHaveBeenCalledWith("TR1_001");
  });
});
