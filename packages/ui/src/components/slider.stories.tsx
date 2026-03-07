import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Slider, Fader } from "./slider";

const meta: Meta<typeof Slider> = {
  title: "Design System/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: { backgrounds: { default: "dark", values: [{ name: "dark", value: "#141416" }] } },
};

export default meta;
type Story = StoryObj<typeof Slider>;

function SliderDemo({
  label,
  orientation,
  color,
}: {
  label?: string;
  orientation?: "horizontal" | "vertical";
  color?: string;
}) {
  const [value, setValue] = useState(0.5);
  return (
    <div
      className="flex flex-col items-center gap-3 p-6"
      style={{ height: orientation === "vertical" ? 180 : undefined }}
    >
      {label && <span style={{ color: "#aaa", fontSize: 11 }}>{label}</span>}
      <Slider
        value={value}
        onChange={setValue}
        orientation={orientation ?? "vertical"}
        color={color}
        className={orientation === "horizontal" ? "w-48" : "h-32"}
      />
      <span style={{ color: "#888", fontSize: 11 }}>Value: {value.toFixed(2)}</span>
    </div>
  );
}

export const Vertical: Story = {
  render: () => <SliderDemo label="Vertical" orientation="vertical" />,
};

export const Horizontal: Story = {
  render: () => <SliderDemo label="Horizontal" orientation="horizontal" />,
};

export const CyanColor: Story = {
  render: () => (
    <SliderDemo label="Cyan" orientation="vertical" color="var(--color-accent-cyan, #00e5ff)" />
  ),
};

export const GreenColor: Story = {
  render: () => (
    <SliderDemo label="Green" orientation="vertical" color="var(--color-accent-green, #00e676)" />
  ),
};

export const MixerStrip: Story = {
  render: () => (
    <div className="flex items-end gap-4 p-6 bg-[#1a1a1e] rounded-xl">
      {["CH1", "CH2", "CH3", "CH4"].map((ch) => {
        const [v, setV] = useState(0.75);
        return (
          <div key={ch} className="flex flex-col items-center gap-2">
            <Slider
              value={v}
              onChange={setV}
              orientation="vertical"
              color="var(--color-accent-cyan, #00e5ff)"
              className="h-32"
              label={ch}
            />
            <span style={{ color: "#888", fontSize: 10 }}>{ch}</span>
          </div>
        );
      })}
    </div>
  ),
};

export const FaderComponent: Story = {
  name: "Fader (dB)",
  render: () => {
    const [db, setDb] = useState(0);
    return (
      <div className="p-6 bg-[#1a1a1e] rounded-xl flex flex-col items-center gap-3">
        <Fader value={db} onChange={setDb} label="Volume" className="h-36" />
        <span style={{ color: "#888", fontSize: 11 }}>
          {db === -60 ? "-∞ dB" : `${db > 0 ? "+" : ""}${db.toFixed(1)} dB`}
        </span>
      </div>
    );
  },
};
