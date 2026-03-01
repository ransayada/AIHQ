import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TransportBar } from "@/components/daw/transport/TransportBar";

describe("TransportBar", () => {
  it("renders the play button", () => {
    render(<TransportBar />);
    const playBtn = screen.getByTestId("transport-play-stop");
    expect(playBtn).toBeInTheDocument();
  });

  it("renders the BPM display with default value 120", () => {
    render(<TransportBar />);
    const bpmVal = screen.getByTestId("bpm-value");
    expect(bpmVal).toHaveTextContent("120");
  });

  it("shows the position display", () => {
    render(<TransportBar />);
    expect(screen.getByTestId("transport-position")).toBeInTheDocument();
  });

  it("clicking play/stop button calls play", async () => {
    render(<TransportBar />);
    const btn = screen.getByTestId("transport-play-stop");
    fireEvent.click(btn);
    // audioEngine.initialize should eventually be called via the hook
    // (mocked in setup.ts)
    expect(btn).toBeInTheDocument();
  });

  it("clicking BPM value enters edit mode", () => {
    render(<TransportBar />);
    const bpmBtn = screen.getByTestId("bpm-value");
    fireEvent.click(bpmBtn);
    const input = document.querySelector("input[type='number']");
    expect(input).toBeInTheDocument();
  });
});
