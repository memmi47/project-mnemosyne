import { describe, expect, it } from "vitest";
import { MemoryEventStore } from "../../src/data/event-store/memory-event-store";
import type { LearningEvent } from "../../src/domain/models";

describe("event store", () => {
  it("T-007 appends events without dropping them", async () => {
    const store = new MemoryEventStore();
    const event: LearningEvent = {
      event_id: "evt_000001",
      event_type: "answer_evaluated",
      timestamp: "2026-06-27T00:00:00.000Z",
      user_id: "user_jungdo",
      session_id: "session_000001",
      learning_object_id: "lo_000001",
      activity_type: "retrieval",
      is_correct: true,
      response_latency_ms: 4200,
      hint_used: false,
      attempt_count: 1,
      error_type: null,
      metadata: {},
    };

    await store.append(event);
    await store.append({ ...event, event_id: "evt_000002" });

    expect(await store.findAll()).toHaveLength(2);
    expect(await store.findByLearningObject("user_jungdo", "lo_000001")).toHaveLength(2);
  });
});
