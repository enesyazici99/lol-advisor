import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

let mockSearchQuery = "";
let mockSelectedRole: string | null = null;

vi.mock("@/stores/appStore", () => ({
  useAppStore: (selector: any) => {
    const state = {
      selectedRole: mockSelectedRole,
      searchQuery: mockSearchQuery,
    };
    return selector(state);
  },
}));

import { ChampionGrid } from "@/components/champions/ChampionGrid";
import type { DDragonChampion } from "@/lib/riot/ddragon";

const mockChampions: Record<string, DDragonChampion> = {
  Ezreal: {
    id: "Ezreal",
    key: "81",
    name: "Ezreal",
    title: "the Prodigal Explorer",
    tags: ["Marksman", "Mage"],
    image: { full: "Ezreal.png" },
  },
  Garen: {
    id: "Garen",
    key: "86",
    name: "Garen",
    title: "The Might of Demacia",
    tags: ["Fighter", "Tank"],
    image: { full: "Garen.png" },
  },
  Ahri: {
    id: "Ahri",
    key: "103",
    name: "Ahri",
    title: "the Nine-Tailed Fox",
    tags: ["Mage", "Assassin"],
    image: { full: "Ahri.png" },
  },
};

describe("ChampionGrid", () => {
  it("renders all champions", () => {
    mockSearchQuery = "";
    mockSelectedRole = null;
    render(<ChampionGrid champions={mockChampions} version="14.24.1" />);
    expect(screen.getByText("Ezreal")).toBeInTheDocument();
    expect(screen.getByText("Garen")).toBeInTheDocument();
    expect(screen.getByText("Ahri")).toBeInTheDocument();
  });

  it("filters by search query", () => {
    mockSearchQuery = "ezr";
    mockSelectedRole = null;
    render(<ChampionGrid champions={mockChampions} version="14.24.1" />);
    expect(screen.getByText("Ezreal")).toBeInTheDocument();
    expect(screen.queryByText("Garen")).not.toBeInTheDocument();
    expect(screen.queryByText("Ahri")).not.toBeInTheDocument();
    mockSearchQuery = "";
  });

  it("shows no champions found message", () => {
    mockSearchQuery = "zzzzzzz";
    mockSelectedRole = null;
    render(<ChampionGrid champions={mockChampions} version="14.24.1" />);
    expect(screen.getByText(/No champions found/)).toBeInTheDocument();
    mockSearchQuery = "";
  });
});
