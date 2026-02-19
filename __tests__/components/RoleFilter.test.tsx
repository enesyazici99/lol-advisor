import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/stores/appStore", () => {
  const setSelectedRole = vi.fn();
  return {
    useAppStore: (selector: any) => {
      const state = {
        selectedRole: null,
        setSelectedRole,
      };
      return selector(state);
    },
  };
});

import { RoleFilter } from "@/components/champions/RoleFilter";

describe("RoleFilter", () => {
  it("renders ALL button and role buttons", () => {
    render(<RoleFilter />);
    expect(screen.getByText("ALL")).toBeInTheDocument();
    expect(screen.getByText("TOP")).toBeInTheDocument();
    expect(screen.getByText("JGL")).toBeInTheDocument();
    expect(screen.getByText("MID")).toBeInTheDocument();
    expect(screen.getByText("ADC")).toBeInTheDocument();
    expect(screen.getByText("SUP")).toBeInTheDocument();
  });

  it("renders 6 buttons total", () => {
    const { container } = render(<RoleFilter />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(6);
  });
});
