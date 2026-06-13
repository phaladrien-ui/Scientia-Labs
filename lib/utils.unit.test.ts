import { describe, expect, it } from "vitest";
import {
  cn,
  convertToUIMessages,
  generateUUID,
  getDocumentTimestampByIndex,
  getTextFromMessage,
  sanitizeText,
} from "./utils";
import type { DBMessage, Document } from "./db/schema";

describe("generateUUID", () => {
  it("returns a string matching UUID v4 format", () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("generates unique values", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateUUID()));
    expect(ids.size).toBe(50);
  });
});

describe("sanitizeText", () => {
  it("removes <has_function_call> tags", () => {
    expect(sanitizeText("Hello <has_function_call>world")).toBe("Hello world");
  });

  it("returns text unchanged when no tag is present", () => {
    expect(sanitizeText("nothing to strip")).toBe("nothing to strip");
  });

  it("removes only the first occurrence (uses String.replace)", () => {
    expect(
      sanitizeText("<has_function_call>a<has_function_call>")
    ).toBe("a<has_function_call>");
  });
});

describe("cn", () => {
  it("merges class names with tailwind-merge", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("handles conditional class names via clsx", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toBe("base extra");
  });
});

describe("getDocumentTimestampByIndex", () => {
  const now = new Date("2025-01-01T00:00:00Z");
  const docs: Document[] = [
    {
      id: "1",
      createdAt: now,
      title: "A",
      content: null,
      kind: "text",
      userId: "u1",
    },
  ];

  it("returns the document's createdAt for a valid index", () => {
    expect(getDocumentTimestampByIndex(docs, 0)).toBe(now);
  });

  it("returns a new Date when index exceeds array length", () => {
    const result = getDocumentTimestampByIndex(docs, 5);
    expect(result).toBeInstanceOf(Date);
  });

  it("returns a new Date when documents array is empty / falsy", () => {
    const result = getDocumentTimestampByIndex(
      null as unknown as Document[],
      0
    );
    expect(result).toBeInstanceOf(Date);
  });
});

describe("convertToUIMessages", () => {
  it("maps DBMessage[] to ChatMessage[]", () => {
    const dbMessages: DBMessage[] = [
      {
        id: "msg-1",
        chatId: "chat-1",
        role: "user",
        parts: [{ type: "text", text: "Hello" }],
        attachments: [],
        createdAt: new Date("2025-06-01T12:00:00Z"),
      },
    ];

    const result = convertToUIMessages(dbMessages);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("msg-1");
    expect(result[0].role).toBe("user");
    expect(result[0].parts).toEqual([{ type: "text", text: "Hello" }]);
    expect(result[0].metadata?.createdAt).toBeTruthy();
  });

  it("returns an empty array for empty input", () => {
    expect(convertToUIMessages([])).toEqual([]);
  });
});

describe("getTextFromMessage", () => {
  it("extracts text parts and joins them", () => {
    const message = {
      id: "1",
      role: "user" as const,
      parts: [
        { type: "text" as const, text: "Hello " },
        { type: "text" as const, text: "world" },
      ],
    };
    expect(getTextFromMessage(message)).toBe("Hello world");
  });

  it("ignores non-text parts", () => {
    const message = {
      id: "1",
      role: "assistant" as const,
      parts: [
        { type: "text" as const, text: "answer" },
        { type: "tool-invocation" as const, toolInvocationId: "t1", toolName: "x", state: "result" as const, args: {}, result: {} },
      ],
    };
    expect(getTextFromMessage(message)).toBe("answer");
  });

  it("returns empty string when there are no text parts", () => {
    const message = {
      id: "1",
      role: "assistant" as const,
      parts: [] as any[],
    };
    expect(getTextFromMessage(message)).toBe("");
  });
});
