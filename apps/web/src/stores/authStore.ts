"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: "Free" | "Pro" | "Studio";
  avatarUrl?: string;
  timezone: string;
  createdAt: string;
};

type AuthState = {
  user: UserProfile | null;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string }>;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<UserProfile, "firstName" | "lastName" | "timezone">>) => void;
};

// Local user storage key (stores list of registered users)
const USERS_KEY = "aihq:users";

type StoredUser = UserProfile & { passwordHash: string };

function hashPassword(pw: string): string {
  // Simple deterministic hash for dev-mode only (not cryptographically secure)
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = ((h << 5) + h) ^ pw.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as StoredUser[];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isSignedIn: false,

      signIn: async (email, password) => {
        const users = getStoredUsers();
        const found = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() &&
                 u.passwordHash === hashPassword(password)
        );
        if (!found) return { error: "Invalid email or password." };
        const { passwordHash: _, ...profile } = found;
        set({ user: profile, isSignedIn: true });
        return {};
      },

      signUp: async (email, password, firstName, lastName) => {
        const users = getStoredUsers();
        if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { error: "An account with this email already exists." };
        }
        const profile: UserProfile = {
          id: `user_${Date.now()}`,
          email: email.toLowerCase(),
          firstName,
          lastName,
          plan: "Free",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          createdAt: new Date().toISOString(),
        };
        const stored: StoredUser = { ...profile, passwordHash: hashPassword(password) };
        saveStoredUsers([...users, stored]);
        set({ user: profile, isSignedIn: true });
        return {};
      },

      signOut: () => {
        set({ user: null, isSignedIn: false });
      },

      updateProfile: (patch) => {
        const current = get().user;
        if (!current) return;
        const updated = { ...current, ...patch };
        set({ user: updated });
        // Also update the stored users list
        const users = getStoredUsers();
        const idx = users.findIndex((u) => u.id === current.id);
        if (idx >= 0) {
          users[idx] = { ...users[idx]!, ...patch };
          saveStoredUsers(users);
        }
      },
    }),
    {
      name: "aihq:auth",
      partialize: (state) => ({ user: state.user, isSignedIn: state.isSignedIn }),
    }
  )
);
