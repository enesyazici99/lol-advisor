import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { CyberCard } from "@/components/ui/CyberCard";

describe("CyberCard", () => {
  it("renders children", () => {
    render(<CyberCard>Test Content</CyberCard>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies rounded card styling", () => {
    const { container } = render(<CyberCard>Content</CyberCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("rounded-xl");
    expect(card.className).toContain("border-border");
  });

  it("applies surface background", () => {
    const { container } = render(<CyberCard>Content</CyberCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("bg-surface");
  });

  it("passes additional className", () => {
    const { container } = render(<CyberCard className="extra-class">Content</CyberCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("extra-class");
  });
});
