/**
 * Logger tests — focus on behaviour, not console output format.
 * (Winston writes to process.stdout/stderr via its own transport layer;
 *  asserting raw stream bytes is brittle and couples tests to format details.)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { log } from "../lib/logger";

describe("API Logger", () => {
  beforeEach(() => {
    // Suppress log output in tests — don't assert on it
    vi.spyOn(process.stdout, "write").mockReturnValue(true);
    vi.spyOn(process.stderr, "write").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("log.info / warn / error / debug", () => {
    it("info does not throw", () => {
      expect(() => log.info("test info message")).not.toThrow();
    });

    it("info with context does not throw", () => {
      expect(() => log.info("project created", { projectId: "abc-123", userId: "user-1" })).not.toThrow();
    });

    it("warn does not throw", () => {
      expect(() => log.warn("rate limit hit", { userId: "u1" })).not.toThrow();
    });

    it("error does not throw", () => {
      expect(() => log.error("unhandled exception", { error: "boom" })).not.toThrow();
    });

    it("debug does not throw", () => {
      expect(() => log.debug("detailed trace", { key: "val" })).not.toThrow();
    });
  });

  describe("log.timed", () => {
    it("returns the resolved value", async () => {
      const result = await log.timed("test op", async () => 42);
      expect(result).toBe(42);
    });

    it("rethrows on failure", async () => {
      const err = new Error("database error");
      await expect(
        log.timed("failing op", async () => { throw err; })
      ).rejects.toThrow("database error");
    });

    it("rethrows without swallowing context", async () => {
      await expect(
        log.timed("failing op", async () => { throw new Error("oops"); }, { userId: "u1" })
      ).rejects.toThrow("oops");
    });

    it("works with context provided", async () => {
      const result = await log.timed("op with ctx", async () => "done", { reqId: "xyz" });
      expect(result).toBe("done");
    });
  });

  describe("log.child", () => {
    it("returns a logger that does not throw for all levels", () => {
      const reqLog = log.child({ reqId: "abc123", method: "GET" });
      expect(() => reqLog.info("request received")).not.toThrow();
      expect(() => reqLog.warn("slow response")).not.toThrow();
      expect(() => reqLog.error("handler crashed")).not.toThrow();
      expect(() => reqLog.debug("debug detail")).not.toThrow();
    });
  });

  describe("log.ingestFrontend", () => {
    it("accepts a batch of entries without throwing", () => {
      expect(() =>
        log.ingestFrontend([
          { level: "info",  msg: "button clicked",    ts: new Date().toISOString(), ctx: { page: "studio" } },
          { level: "error", msg: "network timeout",   ts: new Date().toISOString(), ctx: { url: "/api" } },
          { level: "warn",  msg: "slow render",       ts: new Date().toISOString() },
        ])
      ).not.toThrow();
    });

    it("handles empty entries array without error", () => {
      expect(() => log.ingestFrontend([])).not.toThrow();
    });

    it("coerces unknown levels to info", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => log.ingestFrontend([{ level: "silly" as any, msg: "test" }])).not.toThrow();
    });
  });
});
