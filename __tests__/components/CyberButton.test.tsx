import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CyberButton } from "@/components/ui/CyberButton";

describe("CyberButton", () => {
  it("renders children text", () => {
    render(<CyberButton>Click Me</CyberButton>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("calls onClick handler", () => {
    const handleClick = vi.fn();
    render(<CyberButton onClick={handleClick}>Click</CyberButton>);
    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("applies primary variant by default", () => {
    const { container } = render(<CyberButton>Test</CyberButton>);
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("bg-accent");
  });

  it("applies tab variant with active state", () => {
    const { container } = render(<CyberButton variant="tab" active>Active Tab</CyberButton>);
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("bg-accent");
    expect(btn?.className).toContain("text-white");
  });

  it("handles disabled state", () => {
    const handleClick = vi.fn();
    render(<CyberButton disabled onClick={handleClick}>Disabled</CyberButton>);
    const btn = screen.getByText("Disabled");
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
