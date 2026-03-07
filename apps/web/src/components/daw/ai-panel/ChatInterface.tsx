"use client";

import * as React from "react";
import { Send, Loader2 } from "lucide-react";
import { useAIStore } from "@/stores/aiStore";
import { useTransportStore } from "@/stores/transportStore";
import { cn } from "@aihq/ui";

export function ChatInterface() {
  const { chatMessages, streamingMessage, isGenerating, addChatMessage, appendStreamToken, commitStreamedMessage, setGenerating } =
    useAIStore();
  const { bpm } = useTransportStore();

  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, streamingMessage]);

  const handleSend = async (overrideMessage?: string) => {
    const msg = (overrideMessage ?? input).trim();
    if (!msg || isGenerating) return;

    setInput("");
    addChatMessage({ role: "user", content: msg });
    setGenerating(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: msg },
          ],
          projectContext: { bpm, key: "C", scale: "major", trackCount: 0 },
        }),
      });

      if (!response.ok || !response.body) {
        const err = await response.json().catch(() => ({}));
        addChatMessage({
          role: "assistant",
          content: (err as { error?: { message?: string } }).error?.message ?? "Failed to get response. Please try again.",
        });
        return;
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        appendStreamToken(decoder.decode(value));
      }

      commitStreamedMessage();
    } catch {
      addChatMessage({
        role: "assistant",
        content: "Network error. Please check your connection.",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatMessages.length === 0 && (
          <div className="text-center text-[var(--color-studio-300)] text-xs mt-4">
            <p className="mb-2">Ask me anything about music production</p>
            <div className="space-y-1">
              {[
                "Suggest a chord progression in C minor",
                "How do I make a trap hi-hat pattern?",
                "Tips for mixing kick and bass?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    void handleSend(suggestion);
                  }}
                  className="block w-full text-left px-2 py-1.5 rounded text-xs border border-[var(--color-studio-600)] hover:bg-[var(--color-studio-600)] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "text-xs leading-relaxed",
              msg.role === "user"
                ? "text-white bg-[var(--color-studio-600)] rounded-lg px-3 py-2 ml-4"
                : "text-[var(--color-studio-100)]"
            )}
          >
            {msg.role === "assistant" && (
              <span className="text-[9px] uppercase tracking-widest text-[var(--color-accent-purple)] block mb-1">
                AIHQ Assistant
              </span>
            )}
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}

        {/* Streaming response */}
        {streamingMessage && (
          <div className="text-xs leading-relaxed text-[var(--color-studio-100)]">
            <span className="text-[9px] uppercase tracking-widest text-[var(--color-accent-purple)] block mb-1">
              AIHQ Assistant
            </span>
            <p className="whitespace-pre-wrap">{streamingMessage}</p>
            <span className="inline-block w-1.5 h-3 bg-[var(--color-accent-purple)] animate-pulse ml-0.5" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-studio-600)] p-2">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about music production..."
            rows={2}
            className="flex-1 text-xs bg-[var(--color-studio-700)] border border-[var(--color-studio-500)] rounded px-2 py-1.5 text-white placeholder-[var(--color-studio-400)] resize-none outline-none focus:border-[var(--color-accent-purple)] transition-colors"
            disabled={isGenerating}
          />
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || isGenerating}
            className="w-8 flex-shrink-0 flex items-center justify-center rounded bg-[var(--color-accent-purple)] text-white disabled:opacity-40 hover:bg-[var(--color-accent-purple-dim)] transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <p className="text-[9px] text-[var(--color-studio-400)] mt-1">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
