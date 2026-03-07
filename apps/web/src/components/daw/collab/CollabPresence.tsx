"use client";
import { useEffect } from "react";
import { useCollabStore } from "@/stores/collabStore";
import { Users, Wifi, WifiOff, Loader2 } from "lucide-react";

interface CollabPresenceProps {
  projectId: string;
  userId:    string;
  userName:  string;
}

export function CollabPresence({ projectId, userId, userName }: CollabPresenceProps) {
  const { status, users, connect, disconnect } = useCollabStore();

  useEffect(() => {
    connect(projectId, userId, userName);
    return () => disconnect();
  }, [projectId, userId, userName, connect, disconnect]);

  const others = users.filter((u) => u.userId !== userId);

  return (
    <div className="flex items-center gap-1.5 px-2">
      {/* Status indicator */}
      {status === "connecting" && <Loader2 className="w-3 h-3 text-[var(--color-studio-400)] animate-spin" />}
      {status === "connected"  && <Wifi className="w-3 h-3 text-green-400" />}
      {status === "error"      && <WifiOff className="w-3 h-3 text-red-400" />}
      {status === "disconnected" && <WifiOff className="w-3 h-3 text-[var(--color-studio-600)]" />}

      {/* Other users' avatars */}
      {others.length > 0 && (
        <div className="flex -space-x-1">
          {others.slice(0, 4).map((u) => (
            <div
              key={u.userId}
              title={u.userName}
              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-[var(--color-studio-800)] flex-shrink-0"
              style={{ background: u.color }}
            >
              {u.userName.charAt(0).toUpperCase()}
            </div>
          ))}
          {others.length > 4 && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-[var(--color-studio-800)] bg-[var(--color-studio-600)]">
              +{others.length - 4}
            </div>
          )}
        </div>
      )}

      {others.length === 0 && status === "connected" && (
        <span className="text-[10px] text-[var(--color-studio-500)] flex items-center gap-1">
          <Users className="w-3 h-3" /> Solo
        </span>
      )}
    </div>
  );
}
