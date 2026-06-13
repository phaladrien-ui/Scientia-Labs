import { describe, expect, it } from "vitest";
import {
  DEFAULT_CHAT_MODEL,
  allowedModelIds,
  chatModels,
  getActiveModels,
  modelsByProvider,
  titleModel,
} from "./models";

describe("DEFAULT_CHAT_MODEL", () => {
  it("is a non-empty string", () => {
    expect(DEFAULT_CHAT_MODEL).toBeTruthy();
    expect(typeof DEFAULT_CHAT_MODEL).toBe("string");
  });

  it("exists in the chatModels list", () => {
    const ids = chatModels.map((m) => m.id);
    expect(ids).toContain(DEFAULT_CHAT_MODEL);
  });
});

describe("chatModels", () => {
  it("is a non-empty array", () => {
    expect(chatModels.length).toBeGreaterThan(0);
  });

  it("each model has required fields", () => {
    for (const model of chatModels) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.provider).toBeTruthy();
      expect(typeof model.description).toBe("string");
    }
  });

  it("model ids follow provider/name format", () => {
    for (const model of chatModels) {
      expect(model.id).toContain("/");
      expect(model.id.split("/")).toHaveLength(2);
    }
  });

  it("has no duplicate model ids", () => {
    const ids = chatModels.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("titleModel", () => {
  it("has an id and provider", () => {
    expect(titleModel.id).toBeTruthy();
    expect(titleModel.provider).toBeTruthy();
  });
});

describe("getActiveModels", () => {
  it("returns all chat models", () => {
    const models = getActiveModels();
    expect(models).toBe(chatModels);
  });
});

describe("allowedModelIds", () => {
  it("is a Set containing all chat model ids", () => {
    expect(allowedModelIds).toBeInstanceOf(Set);
    for (const model of chatModels) {
      expect(allowedModelIds.has(model.id)).toBe(true);
    }
  });

  it("has the same size as chatModels", () => {
    expect(allowedModelIds.size).toBe(chatModels.length);
  });
});

describe("modelsByProvider", () => {
  it("groups models by their provider field", () => {
    for (const model of chatModels) {
      expect(modelsByProvider[model.provider]).toBeDefined();
      expect(
        modelsByProvider[model.provider].some((m) => m.id === model.id)
      ).toBe(true);
    }
  });

  it("total models across providers equals chatModels length", () => {
    const total = Object.values(modelsByProvider).reduce(
      (sum, models) => sum + models.length,
      0
    );
    expect(total).toBe(chatModels.length);
  });
});
