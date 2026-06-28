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
import { findAnswerGraphEntry } from "../data/static-loader/answer-graph-loader";
import { seedLearningObject } from "../data/static-loader/sqlite-learning-object-repository";
import type { ActivityType, ErrorType, LearningEvent, MemoryObject } from "../domain/models";
import { DEFAULT_USER_ID } from "./today-mission-service";

export interface SubmitAnswerRequest {
  session_id: string;
  learning_object_id: string;
  activity_type: ActivityType;
  answer: string;
  response_latency_ms: number;
  hint_used: boolean;
  attempt_count: number;
}

export interface SubmitAnswerResponse {
  is_correct: boolean;
  correct_answer: string | null;
  can_reveal_answer: boolean;
  feedback_ko: string;
  updated_memory: Pick<MemoryObject, "memory_strength" | "mastery_score" | "forgetting_risk" | "next_review_at">;
}

export async function submitAnswer(
  request: SubmitAnswerRequest,
  userId = DEFAULT_USER_ID,
  now = new Date()
): Promise<SubmitAnswerResponse> {
  const learningObject = await findLearningObjectById(request.learning_object_id);

  if (!learningObject) {
    throw new Error("Learning Object를 찾을 수 없습니다.");
  }

  await seedLearningObject(learningObject);

  if (request.attempt_count > 1) {
    await appendLearningEvent(buildEvent({
      request,
      userId,
      now,
      eventType: "retry_attempted",
      isCorrect: null,
      errorType: null,
    }));
  }

  const submittedEvent = buildEvent({
    request,
    userId,
    now,
    eventType: "answer_submitted",
    isCorrect: null,
    errorType: null,
  });
  await appendLearningEvent(submittedEvent);

  const answerEntry = await findAnswerGraphEntry(request.learning_object_id);
  const acceptedAnswers = answerEntry?.accepted_answers.length
    ? answerEntry.accepted_answers
    : [answerEntry?.answer ?? learningObject.expression];
  const primaryAnswer = answerEntry?.answer || learningObject.expression;
  const isCorrect = evaluateAnswer(request.answer, acceptedAnswers, request.activity_type);
  const errorType = isCorrect ? null : inferErrorType(request.answer, primaryAnswer);
  const evaluatedEvent = buildEvent({
    request,
    userId,
    now,
    eventType: "answer_evaluated",
    isCorrect,
    errorType,
  });
  await appendLearningEvent(evaluatedEvent);

  const currentMemory =
    (await findMemoryObject(userId, request.learning_object_id)) ??
    createInitialMemoryObject(userId, request.learning_object_id, now);
  const updatedMemory = updateMemoryObject(evaluatedEvent, currentMemory, now);
  await saveMemoryObject(updatedMemory);

  const [recommendation] = generateDailyRecommendations([updatedMemory], now, 1);
  if (recommendation && recommendation.activity_type !== "hold") {
    await saveReviewQueueRecommendation(
      userId,
      recommendation,
      updatedMemory.next_review_at ?? now.toISOString()
    );
    await appendLearningEvent({
      ...evaluatedEvent,
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
    ...evaluatedEvent,
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
    is_correct: isCorrect,
    correct_answer: isCorrect || request.attempt_count >= 2 ? primaryAnswer : null,
    can_reveal_answer: isCorrect || request.attempt_count >= 2,
    feedback_ko: buildFeedback(isCorrect, request.attempt_count, errorType),
    updated_memory: {
      memory_strength: updatedMemory.memory_strength,
      mastery_score: updatedMemory.mastery_score,
      forgetting_risk: updatedMemory.forgetting_risk,
      next_review_at: updatedMemory.next_review_at,
    },
  };
}

export function evaluateAnswer(answer: string, correctAnswer: string | string[], activityType: ActivityType): boolean {
  const normalizedAnswer = normalizeAnswer(answer);
  const normalizedCorrectAnswers = (Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]).map(normalizeAnswer);

  if (
    activityType === "application" ||
    activityType === "conversation" ||
    activityType === "sentence_production" ||
    activityType === "conversation_turn"
  ) {
    return normalizedCorrectAnswers.some((candidate) => normalizedAnswer.includes(candidate));
  }

  // 문맥 빈칸 채우기(fill_blank) 등 구동사 퀴즈에서, 'go off' 중 'off'만 입력해도 정답으로 인정
  return normalizedCorrectAnswers.some((candidate) => {
    if (normalizedAnswer === candidate) return true;
    
    // candidate가 2단어 이상인 경우(예: 'go off', 'pick up'), 동사(첫 단어)를 제외한 particle 부분 추출
    const parts = candidate.split(" ");
    if (parts.length > 1) {
      const particleOnly = parts.slice(1).join(" ");
      if (normalizedAnswer === particleOnly) return true;
      // 3단어 구동사(예: 'come up with')의 경우, 마지막 단어('with')나 뒤의 두 단어('up with') 매칭 확인
      if (parts.length === 3 && normalizedAnswer === parts[2]) return true;
    }
    return false;
  });
}

function inferErrorType(answer: string, correctAnswer: string): ErrorType {
  if (normalizeAnswer(answer).length === 0) return "production_error";
  if (normalizeAnswer(answer).replace(/\s/g, "") === normalizeAnswer(correctAnswer).replace(/\s/g, "")) {
    return "spelling_error";
  }

  return "production_error";
}

function buildEvent({
  request,
  userId,
  now,
  eventType,
  isCorrect,
  errorType,
}: {
  request: SubmitAnswerRequest;
  userId: string;
  now: Date;
  eventType: LearningEvent["event_type"];
  isCorrect: boolean | null;
  errorType: ErrorType;
}): LearningEvent {
  return {
    event_id: createEventId(`evt_${eventType}`, now),
    event_type: eventType,
    timestamp: now.toISOString(),
    user_id: userId,
    session_id: request.session_id,
    learning_object_id: request.learning_object_id,
    activity_type: request.activity_type,
    is_correct: isCorrect,
    response_latency_ms: request.response_latency_ms,
    hint_used: request.hint_used,
    attempt_count: request.attempt_count,
    error_type: errorType,
    metadata: {
      answer_length: request.answer.length,
    },
  };
}

function buildFeedback(isCorrect: boolean, attemptCount: number, errorType: ErrorType): string {
  if (isCorrect) {
    return "정답입니다. 직접 회상에 성공했으므로 기억 강도와 숙련도가 업데이트됩니다.";
  }

  if (attemptCount < 2) {
    return "아직 정답은 공개하지 않습니다. 표현의 핵심 동사와 particle을 다시 떠올려보세요.";
  }

  if (errorType === "spelling_error") {
    return "형태가 거의 맞습니다. 띄어쓰기와 철자를 확인한 뒤 다시 회상해보세요.";
  }

  return "두 번 실패했으므로 정답을 확인할 수 있습니다. 다음 복습은 더 이른 시점으로 예약됩니다.";
}

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function createEventId(prefix: string, now: Date): string {
  return `${prefix}_${now.getTime()}_${Math.random().toString(36).slice(2, 10)}`;
}
