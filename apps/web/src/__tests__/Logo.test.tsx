import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/layout/Logo";

describe("Logo", () => {
  it("renders with accessible label", () => {
    render(<Logo />);
    const link = screen.getByRole("link", { name: /AIHQ/i });
    expect(link).toBeDefined();
  });

  it("links to / by default", () => {
    render(<Logo />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/");
  });

  it("links to custom href", () => {
    render(<Logo href="/dashboard" />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/dashboard");
  });

  it("renders the logotype text AIHQ", () => {
    render(<Logo />);
    expect(screen.getByText("AIHQ")).toBeDefined();
  });

  it("applies custom className", () => {
    render(<Logo className="my-custom-class" />);
    const link = screen.getByRole("link");
    expect(link.className).toContain("my-custom-class");
  });

  it("renders SVG mark", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
  });

  it("renders sm size without crashing", () => {
    render(<Logo size="sm" />);
    expect(screen.getByRole("link")).toBeDefined();
  });

  it("renders lg size without crashing", () => {
    render(<Logo size="lg" />);
    expect(screen.getByRole("link")).toBeDefined();
  });
});
