import {
  createInitialMemoryObject,
  generateDailyRecommendations,
  updateMemoryObject,
} from "../core/memory/learningEngine";
import { appendLearningEvent } from "../data/event-store/sqlite-event-store";
import {
  findMemoryObject,
  saveMemoryObject,
} from "../data/learner-state/sqlite-memory-repository";
import { saveReviewQueueRecommendation } from "../data/review-queue/sqlite-review-queue-repository";
import { findLearningObjectById } from "../data/static-loader/learning-object-loader";
import { seedLearningObject } from "../data/static-loader/sqlite-learning-object-repository";
import type { ActivityType, LearningEvent, MemoryObject } from "../domain/models";
import { DEFAULT_USER_ID } from "./today-mission-service";

export interface SkipItemRequest {
  session_id: string;
  learning_object_id: string;
  activity_type: ActivityType;
}

export interface SkipItemResponse {
  feedback_ko: string;
  updated_memory: Pick<MemoryObject, "memory_strength" | "mastery_score" | "forgetting_risk" | "next_review_at">;
}

export async function skipItem(
  request: SkipItemRequest,
  userId = DEFAULT_USER_ID,
  now = new Date()
): Promise<SkipItemResponse> {
  const learningObject = await findLearningObjectById(request.learning_object_id);
  if (!learningObject) throw new Error("Learning Object를 찾을 수 없습니다.");

  await seedLearningObject(learningObject);

  const skipEvent: LearningEvent = {
    event_id: createEventId("evt_item_skipped", now),
    event_type: "item_skipped",
    timestamp: now.toISOString(),
    user_id: userId,
    session_id: request.session_id,
    learning_object_id: request.learning_object_id,
    activity_type: request.activity_type,
    is_correct: false,
    response_latency_ms: null,
    hint_used: false,
    attempt_count: 1,
    error_type: "production_error",
    metadata: {
      reason: "manual_skip",
    },
  };
  await appendLearningEvent(skipEvent);

  const currentMemory =
    (await findMemoryObject(userId, request.learning_object_id)) ??
    createInitialMemoryObject(userId, request.learning_object_id, now);
  const updatedMemory = updateMemoryObject(skipEvent, currentMemory, now);
  await saveMemoryObject(updatedMemory);

  const [recommendation] = generateDailyRecommendations([updatedMemory], now, 1);
  if (recommendation && recommendation.activity_type !== "hold") {
    await saveReviewQueueRecommendation(
      userId,
      recommendation,
      updatedMemory.next_review_at ?? now.toISOString()
    );
    await appendLearningEvent({
      ...skipEvent,
      event_id: createEventId("evt_review_scheduled", now),
      event_type: "review_scheduled",
      is_correct: null,
      error_type: null,
      metadata: {
        recommendation_id: recommendation.recommendation_id,
        next_review_at: updatedMemory.next_review_at,
      },
    });
  }

  await appendLearningEvent({
    ...skipEvent,
    event_id: createEventId("evt_mastery", now),
    event_type: "mastery_updated",
    is_correct: null,
    error_type: null,
    metadata: {
      memory_strength: updatedMemory.memory_strength,
      mastery_score: updatedMemory.mastery_score,
      next_review_at: updatedMemory.next_review_at,
    },
  });

  return {
    feedback_ko: "이 항목을 건너뛰었습니다. 스킵도 회상 부담 신호로 저장되며 다음 복습이 앞당겨집니다.",
    updated_memory: {
      memory_strength: updatedMemory.memory_strength,
      mastery_score: updatedMemory.mastery_score,
      forgetting_risk: updatedMemory.forgetting_risk,
      next_review_at: updatedMemory.next_review_at,
    },
  };
}

function createEventId(prefix: string, now: Date): string {
  return `${prefix}_${now.getTime()}_${Math.random().toString(36).slice(2, 10)}`;
}
