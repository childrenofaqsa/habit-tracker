import { describe, it, expect } from "vitest";
import { sha256Hex } from "@/lib/checksum";

describe("sha256Hex", () => {
  it("returns a 64-character hex string", async () => {
    const hash = await sha256Hex("hello");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for same input", async () => {
    const a = await sha256Hex("test-input");
    const b = await sha256Hex("test-input");
    expect(a).toBe(b);
  });

  it("produces different hashes for different inputs", async () => {
    const a = await sha256Hex("input-a");
    const b = await sha256Hex("input-b");
    expect(a).not.toBe(b);
  });

  it("handles empty string", async () => {
    const hash = await sha256Hex("");
    expect(hash).toHaveLength(64);
  });
});
