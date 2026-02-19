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
    const state = { version: "14.24.1" };
    return selector(state);
  },
}));

vi.mock("@/hooks/useProBuilds", () => ({
  useMetaBuild: () => ({
    builds: [],
    isLoading: false,
    error: null,
  }),
}));

import { BuildSummary } from "@/components/probuilds/BuildSummary";

describe("BuildSummary", () => {
  it("shows no data message when empty", () => {
    render(<BuildSummary championKey="Ezreal" championName="Ezreal" />);
    expect(screen.getByText(/No build data available/)).toBeInTheDocument();
  });
});
