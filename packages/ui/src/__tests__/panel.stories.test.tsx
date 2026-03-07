import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Panel } from "../components/panel";
import * as PanelStories from "../components/panel.stories";

describe("Panel stories", () => {
  it("renders the Default story args", () => {
    const { Default } = PanelStories;
    render(<Panel {...(Default.args ?? {})} />);

    expect(screen.getByText("Panel Title")).toBeInTheDocument();
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  it("renders the Collapsible story args", () => {
    const { Collapsible } = PanelStories as { Collapsible: { args?: unknown } };
    render(<Panel title="Panel Title" {...(Collapsible.args ?? {})} />);

    expect(screen.getByText("Panel Title")).toBeInTheDocument();
  });
});


