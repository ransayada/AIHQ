"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Avatar } from "@aihq/ui";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface UserMenuProps {
  name:  string;
  email: string;
  plan:  string;
}

export function UserMenu({ name, email, plan }: UserMenuProps) {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);

  const items = [
    { icon: User,       label: "Account",     href: "/account" },
    { icon: Settings,   label: "Settings",    href: "/account#settings" },
    { icon: HelpCircle, label: "Help & docs", href: "/account#help" },
  ];

  function handleSignOut() {
    signOut();
    router.push("/sign-in");
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none"
          aria-label="Open user menu"
          data-testid="user-menu-trigger"
        >
          <Avatar name={name} email={email} size="sm" showStatus status="online" />
          <div className="flex flex-col leading-tight text-left">
            <span className="text-sm text-[var(--color-studio-50)]">{name}</span>
            <span className="text-[11px] text-[var(--color-studio-300)] uppercase tracking-widest">
              {plan} plan
            </span>
          </div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-56 rounded-xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] shadow-2xl p-1.5 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
        >
          {/* User identity */}
          <div className="px-3 py-2.5 mb-1 border-b border-[var(--color-studio-700)]">
            <p className="text-sm font-semibold text-white truncate">{name}</p>
            <p className="text-[11px] text-[var(--color-studio-400)] truncate mt-0.5">{email}</p>
          </div>

          {/* Plan badge */}
          <div className="px-3 py-2 mb-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-[var(--color-studio-300)] uppercase tracking-widest">
                Current plan
              </span>
              <span className="text-[10px] font-bold text-[var(--color-accent-purple)] uppercase tracking-wide">
                {plan}
              </span>
            </div>
          </div>

          {/* Nav items */}
          {items.map(({ icon: Icon, label, href }) => (
            <DropdownMenu.Item
              key={href}
              onSelect={() => router.push(href)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--color-studio-200)] hover:text-white hover:bg-[var(--color-studio-700)] cursor-pointer outline-none transition-colors"
            >
              <Icon className="w-4 h-4 text-[var(--color-studio-400)]" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="w-3 h-3 text-[var(--color-studio-600)]" />
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-studio-700)]" />

          {/* Sign out */}
          <DropdownMenu.Item
            onSelect={handleSignOut}
            data-testid="sign-out-button"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer outline-none transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
