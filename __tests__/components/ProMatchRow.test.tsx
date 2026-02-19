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

const mockSetExpandedMatchId = vi.fn();

vi.mock("@/stores/appStore", () => ({
  useAppStore: (selector: any) => {
    const state = {
      version: "14.24.1",
      expandedMatchId: null,
      setExpandedMatchId: mockSetExpandedMatchId,
    };
    return selector(state);
  },
}));

import { ProMatchRow } from "@/components/probuilds/ProMatchRow";
import type { ProMatch } from "@/lib/supabase/types";

const mockMatch: ProMatch = {
  id: "test-1",
  champion_key: "Ezreal",
  pro_player: "Faker",
  team: "T1",
  region: "KR",
  role: "MID",
  kills: 10,
  deaths: 2,
  assists: 8,
  win: true,
  items: [3078, 3158, 3004],
  rune_primary_keystone: 8010,
  rune_primary_tree: 8000,
  rune_secondary_tree: 8300,
  spell1: 4,
  spell2: 12,
  skill_order: "Q>W>E",
  item_timeline: null,
  vs_champion: "Ahri",
  cs: 250,
  gold: 15000,
  damage: 25000,
  duration_minutes: 30,
  match_date: new Date().toISOString(),
  source_url: null,
  created_at: new Date().toISOString(),
};

describe("ProMatchRow", () => {
  it("renders player name", () => {
    render(<ProMatchRow match={mockMatch} />);
    expect(screen.getByText("Faker")).toBeInTheDocument();
  });

  it("renders team badge", () => {
    render(<ProMatchRow match={mockMatch} />);
    expect(screen.getByText("T1")).toBeInTheDocument();
  });

  it("renders KDA", () => {
    render(<ProMatchRow match={mockMatch} />);
    expect(screen.getByText("10/2/8")).toBeInTheDocument();
  });

  it("renders win background for winning match", () => {
    const { container } = render(<ProMatchRow match={mockMatch} />);
    const row = container.firstChild as HTMLElement;
    expect(row.className).toContain("bg-win-bg");
  });

  it("renders loss background for losing match", () => {
    const losingMatch = { ...mockMatch, win: false };
    const { container } = render(<ProMatchRow match={losingMatch} />);
    const row = container.firstChild as HTMLElement;
    expect(row.className).toContain("bg-loss-bg");
  });
});
