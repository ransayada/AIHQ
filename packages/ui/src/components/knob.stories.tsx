import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Knob } from "./knob";

const meta: Meta<typeof Knob> = {
  title: "Design System/Knob",
  component: Knob,
  tags: ["autodocs"],
  parameters: { backgrounds: { default: "dark", values: [{ name: "dark", value: "#141416" }] } },
};

export default meta;
type Story = StoryObj<typeof Knob>;

function KnobDemo({ label, unit, color }: { label?: string; unit?: string; color?: string }) {
  const [value, setValue] = useState(0.5);
  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <Knob value={value} onChange={setValue} label={label} unit={unit} color={color} />
      <span style={{ color: "#888", fontSize: 11 }}>Value: {value.toFixed(2)}</span>
    </div>
  );
}

export const Volume:  Story = { render: () => <KnobDemo label="VOL" /> };
export const Pan:     Story = { render: () => <KnobDemo label="PAN" color="var(--color-accent-cyan, #00e5ff)" /> };
export const Filter:  Story = { render: () => <KnobDemo label="CUT" color="#f59e0b" /> };
export const Reverb:  Story = { render: () => <KnobDemo label="REV" color="#8b5cf6" /> };

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6 p-4">
      {(["sm", "md", "lg"] as const).map((size) => {
        const [v, set] = [0.5, () => {}];
        return (
          <div key={size} className="flex flex-col items-center gap-1">
            <Knob value={v} onChange={set} size={size} label={size.toUpperCase()} />
          </div>
        );
      })}
    </div>
  ),
};

export const SynthPanel: Story = {
  render: () => (
    <div className="flex gap-4 p-4 bg-[#1a1a1e] rounded-xl">
      {["ATT", "DEC", "SUS", "REL"].map((label) => {
        const [v, setV] = [0.3, () => {}];
        return <Knob key={label} value={v} onChange={setV} label={label} size="sm" />;
      })}
    </div>
  ),
};
