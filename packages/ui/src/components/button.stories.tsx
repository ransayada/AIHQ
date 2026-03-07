import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Play, Square, Plus, Trash2 } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "Design System/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: { backgrounds: { default: "dark", values: [{ name: "dark", value: "#141416" }] } },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = { args: { children: "Create Project", variant: "default" } };
export const Ghost:   Story = { args: { children: "Cancel",         variant: "ghost"   } };
export const Outline: Story = { args: { children: "Settings",       variant: "outline"  } };
export const Destructive: Story = { args: { children: "Delete",     variant: "destructive" } };
export const Transport: Story = { args: { children: "Play",         variant: "transport" } };
export const TransportActive: Story = { args: { children: "Stop",   variant: "transport-active" } };

export const SizeXS: Story = { args: { children: "XS Button",  size: "xs" } };
export const SizeSM: Story = { args: { children: "SM Button",  size: "sm" } };
export const SizeLG: Story = { args: { children: "LG Button",  size: "lg" } };

export const IconButton: Story = {
  args: { size: "icon", children: <Play className="w-4 h-4" />, "aria-label": "Play" },
};

export const WithIcon: Story = {
  args: { children: <><Plus className="w-4 h-4" /> New Project</>, variant: "default" },
};

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
};

export const TransportPlayStop: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="transport-active"><Square className="w-4 h-4" /> Stop</Button>
      <Button variant="transport"><Play className="w-4 h-4" /> Play</Button>
      <Button variant="destructive"><Trash2 className="w-4 h-4" /> Delete</Button>
    </div>
  ),
};
