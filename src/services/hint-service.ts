import { appendLearningEvent } from "../data/event-store/sqlite-event-store";
import { findLearningObjectById } from "../data/static-loader/learning-object-loader";
import type { ActivityType, LearningEvent } from "../domain/models";
import { DEFAULT_USER_ID } from "./today-mission-service";

export interface HintRequest {
  session_id: string;
  learning_object_id: string;
  activity_type: ActivityType;
  attempt_count: number;
}

export interface HintResponse {
  mode: "recall_hint" | "context_hint" | "contrast_hint";
  hint_ko: string;
  reveal_answer: false;
}

export async function requestHint(
  request: HintRequest,
  userId = DEFAULT_USER_ID,
  now = new Date()
): Promise<HintResponse> {
  const learningObject = await findLearningObjectById(request.learning_object_id);
  if (!learningObject) throw new Error("Learning Object를 찾을 수 없습니다.");

  await appendLearningEvent(buildHintEvent("hint_requested", request, userId, now));

  const response = buildHintResponse({
    attemptCount: request.attempt_count,
    definition: learningObject.definition_ko || learningObject.definition_en,
    grammarPattern: learningObject.grammar_pattern,
    particleCount: learningObject.particles.length,
    hints: learningObject.hints ?? [],
  });

  await appendLearningEvent({
    ...buildHintEvent("ai_feedback_shown", request, userId, now),
    metadata: {
      mode: response.mode,
    },
  });

  return response;
}

function buildHintResponse({
  attemptCount,
  definition,
  grammarPattern,
  particleCount,
  hints,
}: {
  attemptCount: number;
  definition: string;
  grammarPattern: string;
  particleCount: number;
  hints: Array<{ level: number; text_ko: string }>;
}): HintResponse {
  const contentHint = hints
    .filter((hint) => hint.level <= Math.min(attemptCount, 3))
    .sort((a, b) => b.level - a.level)[0];

  if (contentHint) {
    return {
      mode: attemptCount <= 1 ? "recall_hint" : "context_hint",
      hint_ko: contentHint.text_ko,
      reveal_answer: false,
    };
  }

  if (attemptCount <= 1) {
    return {
      mode: "recall_hint",
      hint_ko: `의미 단서부터 잡아보세요. 이 표현은 "${definition || "검수된 뜻"}"와 연결됩니다. 정답 표현은 아직 공개하지 않습니다.`,
      reveal_answer: false,
    };
  }

  if (grammarPattern) {
    return {
      mode: "context_hint",
      hint_ko: `문장 구조를 떠올려보세요. 이 표현은 ${grammarPattern} 패턴으로 쓰입니다.`,
      reveal_answer: false,
    };
  }

  return {
    mode: "contrast_hint",
    hint_ko: `두 단어 이상으로 된 표현입니다. particle ${particleCount}개가 의미를 바꿉니다.`,
    reveal_answer: false,
  };
}

function buildHintEvent(
  eventType: "hint_requested" | "ai_feedback_shown",
  request: HintRequest,
  userId: string,
  now: Date
): LearningEvent {
  return {
    event_id: `${eventType}_${now.getTime()}_${Math.random().toString(36).slice(2, 10)}`,
    event_type: eventType,
    timestamp: now.toISOString(),
    user_id: userId,
    session_id: request.session_id,
    learning_object_id: request.learning_object_id,
    activity_type: request.activity_type,
    is_correct: null,
    response_latency_ms: null,
    hint_used: eventType === "hint_requested",
    attempt_count: request.attempt_count,
    error_type: null,
    metadata: {},
  };
}
