import { describe, expect, it } from "vitest";
import { generateDummyPassword, generateHashedPassword } from "./utils";

describe("generateHashedPassword", () => {
  it("returns a bcrypt hash string", () => {
    const hash = generateHashedPassword("test-password");
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it("produces different hashes for the same password (salted)", () => {
    const h1 = generateHashedPassword("same");
    const h2 = generateHashedPassword("same");
    expect(h1).not.toBe(h2);
  });

  it("produces different hashes for different passwords", () => {
    const h1 = generateHashedPassword("alpha");
    const h2 = generateHashedPassword("beta");
    expect(h1).not.toBe(h2);
  });
});

describe("generateDummyPassword", () => {
  it("returns a bcrypt hash", () => {
    const hash = generateDummyPassword();
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it("generates unique values across calls", () => {
    const a = generateDummyPassword();
    const b = generateDummyPassword();
    expect(a).not.toBe(b);
  });
});
