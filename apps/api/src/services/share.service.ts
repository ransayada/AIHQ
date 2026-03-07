/** Project sharing — generates public share tokens. */
import { log } from "../lib/logger";

export interface ShareRecord {
  token:     string;
  projectId: string;
  ownerId:   string;
  name:      string;
  stateJson: unknown;
  bpm:       number;
  key:       string;
  scale:     string;
  createdAt: Date;
}

const shares = new Map<string, ShareRecord>();

function genToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const shareService = {
  async createShare(
    ownerId: string,
    projectId: string,
    name: string,
    stateJson: unknown,
    bpm: number,
    key: string,
    scale: string,
  ): Promise<ShareRecord> {
    log.info("shareService.create", { ownerId, projectId });

    // Revoke existing share for same project
    for (const [token, rec] of shares) {
      if (rec.projectId === projectId) shares.delete(token);
    }

    const token = genToken();
    const rec: ShareRecord = { token, projectId, ownerId, name, stateJson, bpm, key, scale, createdAt: new Date() };
    shares.set(token, rec);
    log.debug("shareService.create: token generated", { token, projectId });
    return rec;
  },

  async getShare(token: string): Promise<ShareRecord | null> {
    return shares.get(token) ?? null;
  },

  async revokeShare(ownerId: string, projectId: string): Promise<void> {
    log.info("shareService.revoke", { ownerId, projectId });
    for (const [token, rec] of shares) {
      if (rec.projectId === projectId && rec.ownerId === ownerId) shares.delete(token);
    }
  },

  async getShareForProject(ownerId: string, projectId: string): Promise<ShareRecord | null> {
    for (const rec of shares.values()) {
      if (rec.projectId === projectId && rec.ownerId === ownerId) return rec;
    }
    return null;
  },
};
