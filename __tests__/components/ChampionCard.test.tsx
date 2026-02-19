import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

import { ChampionCard } from "@/components/champions/ChampionCard";

describe("ChampionCard", () => {
  it("renders champion name", () => {
    render(
      <ChampionCard
        id="Ezreal"
        name="Ezreal"
        iconUrl="https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Ezreal.png"
      />
    );
    expect(screen.getByText("Ezreal")).toBeInTheDocument();
  });

  it("renders roles", () => {
    render(
      <ChampionCard
        id="Ezreal"
        name="Ezreal"
        iconUrl="https://example.com/icon.png"
        roles={["Marksman", "Mage"]}
      />
    );
    expect(screen.getByText("ADC · Mage")).toBeInTheDocument();
  });

  it("links to champion page", () => {
    const { container } = render(
      <ChampionCard
        id="Ezreal"
        name="Ezreal"
        iconUrl="https://example.com/icon.png"
      />
    );
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/champion/Ezreal");
  });

  it("renders icon image", () => {
    render(
      <ChampionCard
        id="Ezreal"
        name="Ezreal"
        iconUrl="https://example.com/icon.png"
      />
    );
    const img = screen.getByAltText("Ezreal");
    expect(img).toBeInTheDocument();
  });
});
