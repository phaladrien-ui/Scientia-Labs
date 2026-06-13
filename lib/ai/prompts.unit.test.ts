import { describe, expect, it } from "vitest";
import {
  getRequestPromptFromHints,
  systemPrompt,
  updateDocumentPrompt,
  regularPrompt,
  reasoningPrompt,
  artifactsPrompt,
  codePrompt,
  sheetPrompt,
  titlePrompt,
} from "./prompts";

describe("systemPrompt", () => {
  const defaultHints = {
    latitude: undefined,
    longitude: undefined,
    city: undefined,
    country: undefined,
  };

  it("includes regularPrompt and artifactsPrompt when tools are supported", () => {
    const result = systemPrompt({
      requestHints: defaultHints,
      supportsTools: true,
    });
    expect(result).toContain("Scientia");
    expect(result).toContain("createDocument");
  });

  it("returns only regularPrompt when tools are NOT supported", () => {
    const result = systemPrompt({
      requestHints: defaultHints,
      supportsTools: false,
    });
    expect(result).toContain("Scientia");
    expect(result).not.toContain("createDocument(kind, title)");
  });

  it("prepends reasoningPrompt in reasoning mode (with tools)", () => {
    const result = systemPrompt({
      requestHints: defaultHints,
      supportsTools: true,
      mode: "reasoning",
    });
    expect(result).toContain("<reasoning>");
    expect(result).toContain("createDocument");
  });

  it("prepends reasoningPrompt in reasoning mode (without tools)", () => {
    const result = systemPrompt({
      requestHints: defaultHints,
      supportsTools: false,
      mode: "reasoning",
    });
    expect(result).toContain("<reasoning>");
    expect(result).not.toContain("createDocument(kind, title)");
  });
});

describe("updateDocumentPrompt", () => {
  it('uses "script" for code type', () => {
    const result = updateDocumentPrompt("console.log('hi')", "code");
    expect(result).toContain("script");
    expect(result).toContain("console.log");
  });

  it('uses "spreadsheet" for sheet type', () => {
    const result = updateDocumentPrompt("a,b,c", "sheet");
    expect(result).toContain("spreadsheet");
  });

  it('uses "document" for text type', () => {
    const result = updateDocumentPrompt("hello", "text");
    expect(result).toContain("document");
  });

  it('uses "document" for unknown types', () => {
    const result = updateDocumentPrompt("img", "image" as any);
    expect(result).toContain("document");
  });
});

describe("getRequestPromptFromHints", () => {
  it("returns an empty string (current implementation)", () => {
    const result = getRequestPromptFromHints({
      latitude: "40.7",
      longitude: "-74.0",
      city: "New York",
      country: "US",
    });
    expect(result).toBe("");
  });
});

describe("prompt constants", () => {
  it("regularPrompt identifies as Scientia", () => {
    expect(regularPrompt).toContain("Scientia");
    expect(regularPrompt).toContain("Scientia Labs");
  });

  it("reasoningPrompt requires <reasoning> tags", () => {
    expect(reasoningPrompt).toContain("<reasoning>");
    expect(reasoningPrompt).toContain("</reasoning>");
  });

  it("codePrompt mentions self-contained code", () => {
    expect(codePrompt).toContain("self-contained");
  });

  it("sheetPrompt mentions CSV", () => {
    expect(sheetPrompt).toContain("CSV");
  });

  it("titlePrompt asks for short title", () => {
    expect(titlePrompt).toContain("2-5 words");
  });
});
