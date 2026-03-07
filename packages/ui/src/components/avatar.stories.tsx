import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "Design System/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: { backgrounds: { default: "dark", values: [{ name: "dark", value: "#141416" }] } },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = { args: { name: "Dev User", email: "dev@aihq.local" } };
export const WithStatus: Story = { args: { name: "Dev User", showStatus: true, status: "online" } };
export const Away:    Story = { args: { name: "Alice",    showStatus: true, status: "away"   } };
export const Offline: Story = { args: { name: "Bob",      showStatus: true, status: "offline" } };

export const SizeXS: Story = { args: { name: "Dev User", size: "xs" } };
export const SizeSM: Story = { args: { name: "Dev User", size: "sm" } };
export const SizeMD: Story = { args: { name: "Dev User", size: "md" } };
export const SizeLG: Story = { args: { name: "Dev User", size: "lg" } };

export const EmailFallback: Story = { args: { email: "artist@studio.com" } };

export const CollabAvatars: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar name="Alice"   size="sm" showStatus status="online"  />
      <Avatar name="Bob"     size="sm" showStatus status="online"  />
      <Avatar name="Charlie" size="sm" showStatus status="away"    />
      <Avatar name="Dave"    size="sm" showStatus status="offline" />
    </div>
  ),
};
