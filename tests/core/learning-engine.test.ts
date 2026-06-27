import { describe, expect, it } from "vitest";
import {
  calculateForgettingRisk,
  createInitialMemoryObject,
  generateDailyRecommendations,
  scheduleNextReview,
  updateMemoryObject,
} from "../../src/core/memory/learningEngine";
import type { LearningEvent, MemoryObject } from "../../src/domain/models";

const baseMemory: MemoryObject = {
  memory_object_id: "mem_user_jungdo_lo_000001",
  user_id: "user_jungdo",
  learning_object_id: "lo_000001",
  mastery_score: 40,
  memory_strength: 50,
  forgetting_risk: 20,
  learning_stage: "retrieval",
  last_reviewed_at: "2026-06-20T00:00:00.000Z",
  next_review_at: "2026-06-26T00:00:00.000Z",
  correct_count: 2,
  incorrect_count: 1,
  avg_response_latency_ms: 4000,
  confusion_targets: [],
  updated_at: "2026-06-20T00:00:00.000Z",
};

function event(overrides: Partial<LearningEvent>): LearningEvent {
  return {
    event_id: "evt_000001",
    event_type: "answer_evaluated",
    timestamp: "2026-06-27T00:00:00.000Z",
    user_id: "user_jungdo",
    session_id: "session_000001",
    learning_object_id: "lo_000001",
    activity_type: "retrieval",
    is_correct: true,
    response_latency_ms: 3000,
    hint_used: false,
    attempt_count: 1,
    error_type: null,
    metadata: {},
    ...overrides,
  };
}

describe("learning engine", () => {
  it("T-001 increases memory strength after a correct answer", () => {
    const updated = updateMemoryObject(event({ is_correct: true, activity_type: "retrieval" }), baseMemory);

    expect(updated.memory_strength).toBeGreaterThan(baseMemory.memory_strength);
    expect(updated.correct_count).toBe(baseMemory.correct_count + 1);
  });

  it("T-002 decreases memory strength after an incorrect answer", () => {
    const updated = updateMemoryObject(event({ is_correct: false, error_type: "meaning_error" }), baseMemory);

    expect(updated.memory_strength).toBeLessThan(baseMemory.memory_strength);
    expect(updated.incorrect_count).toBe(baseMemory.incorrect_count + 1);
  });

  it("T-003 increases forgetting risk as review age grows", () => {
    const recent = {
      ...baseMemory,
      last_reviewed_at: "2026-06-26T00:00:00.000Z",
      next_review_at: "2026-06-30T00:00:00.000Z",
    };
    const old = {
      ...baseMemory,
      last_reviewed_at: "2026-06-01T00:00:00.000Z",
      next_review_at: "2026-06-10T00:00:00.000Z",
    };

    expect(calculateForgettingRisk(old, new Date("2026-06-27T00:00:00.000Z"))).toBeGreaterThan(
      calculateForgettingRisk(recent, new Date("2026-06-27T00:00:00.000Z"))
    );
  });

  it("T-004 schedules next review by memory strength band", () => {
    const weakNext = scheduleNextReview({ ...baseMemory, memory_strength: 30 }, new Date("2026-06-27T00:00:00.000Z"));
    const stableNext = scheduleNextReview({ ...baseMemory, memory_strength: 80 }, new Date("2026-06-27T00:00:00.000Z"));

    expect(new Date(weakNext).getUTCDate()).toBe(28);
    expect(new Date(stableNext).getUTCDate()).toBe(11);
  });

  it("T-005 puts higher-risk items first", () => {
    const recommendations = generateDailyRecommendations([
      { ...baseMemory, learning_object_id: "lo_low", forgetting_risk: 10, memory_strength: 80 },
      { ...baseMemory, learning_object_id: "lo_high", forgetting_risk: 90, memory_strength: 20 },
    ]);

    expect(recommendations[0]?.learning_object_id).toBe("lo_high");
  });

  it("T-006 recommends contrast for confusion errors", () => {
    const updated = updateMemoryObject(
      event({
        is_correct: false,
        error_type: "confusion_error",
        metadata: { confusion_target: "lo_000002" },
      }),
      baseMemory
    );
    const [recommendation] = generateDailyRecommendations([updated]);

    expect(recommendation?.activity_type).toBe("contrast");
  });

  it("creates an initial memory object for a learning object", () => {
    const memory = createInitialMemoryObject("user_jungdo", "lo_000001", new Date("2026-06-27T00:00:00.000Z"));

    expect(memory.learning_stage).toBe("exposure");
    expect(memory.next_review_at).toBe("2026-06-27T00:00:00.000Z");
  });

  it("decreases memory strength when an item is skipped", () => {
    const updated = updateMemoryObject(
      event({
        event_type: "item_skipped",
        is_correct: false,
        error_type: "production_error",
      }),
      baseMemory
    );

    expect(updated.memory_strength).toBeLessThan(baseMemory.memory_strength);
    expect(updated.incorrect_count).toBe(baseMemory.incorrect_count + 1);
  });
});
