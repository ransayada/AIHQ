import type { Meta, StoryObj } from "@storybook/react";
import { Meter } from "./meter";

const meta: Meta<typeof Meter> = {
  title: "Design System/Meter",
  component: Meter,
  tags: ["autodocs"],
  parameters: { backgrounds: { default: "dark", values: [{ name: "dark", value: "#141416" }] } },
};

export default meta;
type Story = StoryObj<typeof Meter>;

// Meter requires a live AnalyserNode — show placeholder in Storybook
export const Placeholder: Story = {
  render: () => (
    <div className="p-4 flex flex-col gap-2">
      <p style={{ color: "#666", fontSize: 12 }}>
        The Meter component renders with a live Web Audio AnalyserNode.<br />
        In the DAW, it reflects real-time audio levels from each mixer channel.
      </p>
      <div style={{ width: 8, height: 112, background: "linear-gradient(to top, #00e676 70%, #ffea00 85%, #ff1744)", borderRadius: 4 }} />
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className="p-4">
      <div style={{ width: 200, height: 8, background: "linear-gradient(to right, #00e676 70%, #ffea00 85%, #ff1744)", borderRadius: 4 }} />
    </div>
  ),
};
