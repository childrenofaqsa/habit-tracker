import { describe, it, expect } from "vitest";
import { migrateV5ToV6 } from "@/storage/migrations/v5ToV6";

describe("migrateV5ToV6", () => {
  it("adds empty fields and entities arrays", () => {
    const result = migrateV5ToV6({ version: 5 });
    expect(result.fields).toEqual([]);
    expect(result.entities).toEqual([]);
  });

  it("sets analyzerEnabled to false on existing trackers", () => {
    const result = migrateV5ToV6({
      version: 5,
      values: [{ id: "v1", name: "Water", type: "numeric" }],
    });
    const values = result.values as Array<Record<string, unknown>>;
    expect(values[0]!.analyzerEnabled).toBe(false);
  });

  it("preserves existing analyzerEnabled when present", () => {
    const result = migrateV5ToV6({
      version: 5,
      values: [{ id: "v1", analyzerEnabled: true }],
    });
    const values = result.values as Array<Record<string, unknown>>;
    expect(values[0]!.analyzerEnabled).toBe(true);
  });

  it("preserves existing fields and entities", () => {
    const result = migrateV5ToV6({
      version: 5,
      fields: [{ id: "f1" }],
      entities: [{ id: "e1" }],
    });
    expect(result.fields).toHaveLength(1);
    expect(result.entities).toHaveLength(1);
  });
});
