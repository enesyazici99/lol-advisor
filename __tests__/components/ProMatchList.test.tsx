import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

vi.mock("@/stores/appStore", () => ({
  useAppStore: (selector: any) => {
    const state = {
      version: "14.24.1",
      expandedMatchId: null,
      setExpandedMatchId: vi.fn(),
    };
    return selector(state);
  },
}));

vi.mock("@/hooks/useProBuilds", () => ({
  useProMatches: () => ({
    matches: [],
    hasMore: false,
    isLoading: false,
    error: null,
    mutate: vi.fn(),
  }),
}));

import { ProMatchList } from "@/components/probuilds/ProMatchList";

describe("ProMatchList", () => {
  it("shows empty state when no matches", () => {
    render(<ProMatchList championKey="Ezreal" />);
    expect(screen.getByText(/No pro matches found/)).toBeInTheDocument();
  });
});
