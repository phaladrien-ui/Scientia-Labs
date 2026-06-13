import { describe, expect, it } from "vitest";
import {
  ChatbotError,
  getMessageByErrorCode,
  visibilityBySurface,
  type ErrorCode,
  type ErrorType,
  type Surface,
} from "./errors";

describe("getMessageByErrorCode", () => {
  it("returns a database error message for any database-surface code", () => {
    const msg = getMessageByErrorCode("bad_request:database");
    expect(msg).toBe(
      "An error occurred while executing a database query."
    );
  });

  it("returns the correct message for bad_request:api", () => {
    expect(getMessageByErrorCode("bad_request:api")).toBe(
      "The request couldn't be processed. Please check your input and try again."
    );
  });

  it("returns the correct message for rate_limit:chat", () => {
    expect(getMessageByErrorCode("rate_limit:chat")).toBe(
      "You've reached the message limit. Come back in 1 hour to continue chatting."
    );
  });

  it("returns the correct message for not_found:chat", () => {
    expect(getMessageByErrorCode("not_found:chat")).toBe(
      "The requested chat was not found. Please check the chat ID and try again."
    );
  });

  it("returns the correct message for unauthorized:auth", () => {
    expect(getMessageByErrorCode("unauthorized:auth")).toBe(
      "You need to sign in before continuing."
    );
  });

  it("returns the correct message for forbidden:auth", () => {
    expect(getMessageByErrorCode("forbidden:auth")).toBe(
      "Your account does not have access to this feature."
    );
  });

  it("returns the correct message for not_found:document", () => {
    expect(getMessageByErrorCode("not_found:document")).toBe(
      "The requested document was not found. Please check the document ID and try again."
    );
  });

  it("returns the correct message for forbidden:document", () => {
    expect(getMessageByErrorCode("forbidden:document")).toBe(
      "This document belongs to another user. Please check the document ID and try again."
    );
  });

  it("returns the correct message for unauthorized:document", () => {
    expect(getMessageByErrorCode("unauthorized:document")).toBe(
      "You need to sign in to view this document. Please sign in and try again."
    );
  });

  it("returns the correct message for bad_request:document", () => {
    expect(getMessageByErrorCode("bad_request:document")).toBe(
      "The request to create or update the document was invalid. Please check your input and try again."
    );
  });

  it("returns the correct message for offline:chat", () => {
    expect(getMessageByErrorCode("offline:chat")).toBe(
      "We're having trouble sending your message. Please check your internet connection and try again."
    );
  });

  it("returns a fallback message for an unknown code", () => {
    expect(
      getMessageByErrorCode("forbidden:stream" as ErrorCode)
    ).toBe("Something went wrong. Please try again later.");
  });
});

describe("ChatbotError", () => {
  it("parses type and surface from the error code", () => {
    const err = new ChatbotError("not_found:chat");
    expect(err.type).toBe("not_found");
    expect(err.surface).toBe("chat");
  });

  it("sets the human-readable message", () => {
    const err = new ChatbotError("rate_limit:chat");
    expect(err.message).toBe(
      "You've reached the message limit. Come back in 1 hour to continue chatting."
    );
  });

  it("maps error types to correct HTTP status codes", () => {
    const cases: [ErrorCode, number][] = [
      ["bad_request:api", 400],
      ["unauthorized:auth", 401],
      ["forbidden:chat", 403],
      ["not_found:chat", 404],
      ["rate_limit:chat", 429],
      ["offline:chat", 503],
    ];

    for (const [code, expected] of cases) {
      expect(new ChatbotError(code).statusCode).toBe(expected);
    }
  });

  it("preserves the optional cause string", () => {
    const err = new ChatbotError("bad_request:api", "missing field");
    expect(err.cause).toBe("missing field");
  });

  it("extends Error", () => {
    const err = new ChatbotError("not_found:chat");
    expect(err).toBeInstanceOf(Error);
  });

  describe("toResponse", () => {
    it("returns a JSON response with code and message for response-visible surfaces", async () => {
      const err = new ChatbotError("not_found:chat");
      const res = err.toResponse();
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.code).toBe("not_found:chat");
      expect(body.message).toBeTruthy();
    });

    it("hides the real code for log-only surfaces (database)", async () => {
      const err = new ChatbotError("bad_request:database");
      const res = err.toResponse();

      const body = await res.json();
      expect(body.code).toBe("");
      expect(body.message).toBe(
        "Something went wrong. Please try again later."
      );
    });
  });
});

describe("visibilityBySurface", () => {
  it("marks database as log-only", () => {
    expect(visibilityBySurface.database).toBe("log");
  });

  it("marks user-facing surfaces as response", () => {
    const responseSurfaces: Surface[] = [
      "chat",
      "auth",
      "stream",
      "api",
      "history",
      "vote",
      "document",
      "suggestions",
      "activate_gateway",
    ];
    for (const s of responseSurfaces) {
      expect(visibilityBySurface[s]).toBe("response");
    }
  });
});
