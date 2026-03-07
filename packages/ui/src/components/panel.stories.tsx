import type { Meta, StoryObj } from "@storybook/react";
import { Panel } from "./panel";

const meta: Meta<typeof Panel> = {
  title: "Layout/Panel",
  component: Panel,
};

export default meta;

type Story = StoryObj<typeof Panel>;

export const Default: Story = {
  args: {
    title: "Panel Title",
    children: "Panel content",
  },
};

export const Collapsible: Story = {
  args: {
    title: "Panel Title",
    children: "Panel content",
    collapsible: true,
    defaultCollapsed: false,
  },
};

