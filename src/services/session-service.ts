import { appendLearningEvent, findLearningEventsBySession } from "../data/event-store/sqlite-event-store";
import { findMemoryObject } from "../data/learner-state/sqlite-memory-repository";
import { findLearningObjectById } from "../data/static-loader/learning-object-loader";
import { seedLearningObject } from "../data/static-loader/sqlite-learning-object-repository";
import type { ActivityType, LearningEvent } from "../domain/models";
import { DEFAULT_USER_ID } from "./today-mission-service";

export interface StartSessionRequest {
  session_id: string;
  learning_object_id: string;
  activity_type: ActivityType;
}

export interface CompleteSessionRequest {
  session_id: string;
}

export interface SessionSummary {
  session_id: string;
  answered_count: number;
  correct_count: number;
  hint_count: number;
  strengthened_objects: string[];
  weak_objects: string[];
  next_reviews: Array<{
    learning_object_id: string;
    next_review_at: string | null;
  }>;
}

export async function startSession(
  request: StartSessionRequest,
  userId = DEFAULT_USER_ID,
  now = new Date()
): Promise<{ ok: true }> {
  const learningObject = await findLearningObjectById(request.learning_object_id);
  if (!learningObject) throw new Error("Learning Object를 찾을 수 없습니다.");

  await seedLearningObject(learningObject);

  await appendLearningEvent(buildSessionEvent("session_started", request, userId, now));
  await appendLearningEvent(buildSessionEvent("item_shown", request, userId, now));

  return { ok: true };
}

export async function completeSession(
  request: CompleteSessionRequest,
  userId = DEFAULT_USER_ID,
  now = new Date()
): Promise<SessionSummary> {
  const events = await findLearningEventsBySession(userId, request.session_id);
  const learningObjectIds = uniqueStrings(
    events.map((event) => event.learning_object_id).filter((id): id is string => typeof id === "string")
  );

  await appendLearningEvent({
    event_id: createEventId("evt_session_completed", now),
    event_type: "session_completed",
    timestamp: now.toISOString(),
    user_id: userId,
    session_id: request.session_id,
    learning_object_id: null,
    activity_type: null,
    is_correct: null,
    response_latency_ms: null,
    hint_used: false,
    attempt_count: 1,
    error_type: null,
    metadata: {
      answered_count: events.filter((event) => event.event_type === "answer_evaluated").length,
    },
  });

  const memories = await Promise.all(
    learningObjectIds.map((learningObjectId) => findMemoryObject(userId, learningObjectId))
  );
  const presentMemories = memories.filter((memory) => memory !== null);

  return {
    session_id: request.session_id,
    answered_count: events.filter((event) => event.event_type === "answer_evaluated").length,
    correct_count: events.filter((event) => event.event_type === "answer_evaluated" && event.is_correct).length,
    hint_count: events.filter((event) => event.event_type === "hint_requested").length,
    strengthened_objects: presentMemories
      .filter((memory) => memory.memory_strength >= 5)
      .map((memory) => memory.learning_object_id),
    weak_objects: presentMemories
      .filter((memory) => memory.memory_strength < 40)
      .map((memory) => memory.learning_object_id),
    next_reviews: presentMemories.map((memory) => ({
      learning_object_id: memory.learning_object_id,
      next_review_at: memory.next_review_at,
    })),
  };
}

function buildSessionEvent(
  eventType: "session_started" | "item_shown",
  request: StartSessionRequest,
  userId: string,
  now: Date
): LearningEvent {
  return {
    event_id: createEventId(`evt_${eventType}`, now),
    event_type: eventType,
    timestamp: now.toISOString(),
    user_id: userId,
    session_id: request.session_id,
    learning_object_id: request.learning_object_id,
    activity_type: request.activity_type,
    is_correct: null,
    response_latency_ms: null,
    hint_used: false,
    attempt_count: 1,
    error_type: null,
    metadata: {},
  };
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function createEventId(prefix: string, now: Date): string {
  return `${prefix}_${now.getTime()}_${Math.random().toString(36).slice(2, 10)}`;
}
