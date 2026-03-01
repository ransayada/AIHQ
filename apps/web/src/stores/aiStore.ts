"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AIState {
  isGenerating: boolean;
  magentaLoaded: boolean;
  chatMessages: ChatMessage[];
  streamingMessage: string;

  setGenerating: (gen: boolean) => void;
  setMagentaLoaded: (loaded: boolean) => void;
  addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  appendStreamToken: (token: string) => void;
  commitStreamedMessage: () => void;
  clearChat: () => void;
}

export const useAIStore = create<AIState>()(
  devtools(
    (set, get) => ({
      isGenerating: false,
      magentaLoaded: false,
      chatMessages: [],
      streamingMessage: "",

      setGenerating: (gen) => set({ isGenerating: gen }),
      setMagentaLoaded: (loaded) => set({ magentaLoaded: loaded }),

      addChatMessage: (msg) =>
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            { ...msg, id: crypto.randomUUID(), timestamp: Date.now() },
          ],
        })),

      appendStreamToken: (token) =>
        set((state) => ({ streamingMessage: state.streamingMessage + token })),

      commitStreamedMessage: () => {
        const { streamingMessage } = get();
        if (!streamingMessage.trim()) return;
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: streamingMessage,
              timestamp: Date.now(),
            },
          ],
          streamingMessage: "",
        }));
      },

      clearChat: () => set({ chatMessages: [], streamingMessage: "" }),
    }),
    { name: "AIStore" }
  )
);
