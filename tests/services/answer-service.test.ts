import { describe, expect, it } from "vitest";
import { evaluateAnswer } from "../../src/services/answer-service";

describe("answer service", () => {
  it("accepts exact retrieval answers after normalization", () => {
    expect(evaluateAnswer("  Deal   With ", "deal with", "retrieval")).toBe(true);
  });

  it("rejects non-matching retrieval answers", () => {
    expect(evaluateAnswer("deal up", "deal with", "retrieval")).toBe(false);
  });

  it("accepts application answers when the target expression is included", () => {
    expect(evaluateAnswer("We need to deal with this issue.", "deal with", "application")).toBe(true);
  });
});
