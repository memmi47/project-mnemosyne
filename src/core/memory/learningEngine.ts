import { ActivityType, LearningEvent, MemoryObject, Recommendation } from "../../domain/models";

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));

export function createInitialMemoryObject(
  userId: string,
  learningObjectId: string,
  now = new Date()
): MemoryObject {
  const timestamp = now.toISOString();

  return {
    memory_object_id: `mem_${userId}_${learningObjectId}`,
    user_id: userId,
    learning_object_id: learningObjectId,
    mastery_score: 0,
    memory_strength: 0,
    forgetting_risk: 100,
    learning_stage: "exposure",
    last_reviewed_at: null,
    next_review_at: timestamp,
    correct_count: 0,
    incorrect_count: 0,
    avg_response_latency_ms: null,
    confusion_targets: [],
    updated_at: timestamp,
  };
}

export function updateMemoryObject(
  event: LearningEvent,
  memory: MemoryObject,
  now = new Date(event.timestamp)
): MemoryObject {
  let delta = 0;
  const isLearningStateEvent = event.event_type === "answer_evaluated" || event.event_type === "item_skipped";

  if (event.event_type === "answer_evaluated") {
    if (event.is_correct) {
      if (event.activity_type === "recognition") delta = 2;
      else if (event.activity_type === "retrieval") delta = 5;
      else if (event.activity_type === "fill_blank") delta = 6;
      else if (event.activity_type === "context_choice") delta = 6;
      else if (event.activity_type === "sentence_production") delta = 8;
      else if (event.activity_type === "application") delta = 7;
      else if (event.activity_type === "conversation") delta = 10;
      else if (event.activity_type === "conversation_turn") delta = 10;
      else delta = 3;
      if (event.hint_used) delta = Math.min(delta, 2);
    } else {
      delta = event.error_type === "confusion_error" ? -10 : -8;
    }
  }

  if (event.event_type === "item_skipped") delta = -5;

  const memory_strength = clamp(memory.memory_strength + delta);
  const correct_count = memory.correct_count + (event.is_correct ? 1 : 0);
  const incorrect_count = memory.incorrect_count + (event.is_correct === false ? 1 : 0);
  const confusion_targets = updateConfusionTargets(event, memory.confusion_targets);
  const nextMemory = {
    ...memory,
    memory_strength,
    correct_count,
    incorrect_count,
    confusion_targets,
    last_reviewed_at: isLearningStateEvent ? event.timestamp : memory.last_reviewed_at,
    avg_response_latency_ms: updateAverageLatency(memory.avg_response_latency_ms, event.response_latency_ms),
    updated_at: now.toISOString(),
  };

  return {
    ...nextMemory,
    mastery_score: calculateMasteryScore(nextMemory),
    forgetting_risk: calculateForgettingRisk(nextMemory, now),
    next_review_at: isLearningStateEvent ? scheduleNextReview(nextMemory, now, event) : memory.next_review_at,
  };
}

export function calculateMasteryScore(memory: MemoryObject): number {
  const total = memory.correct_count + memory.incorrect_count;
  const accuracy = total === 0 ? 0 : (memory.correct_count / total) * 100;
  return clamp(memory.memory_strength * 0.6 + accuracy * 0.4);
}

export function calculateForgettingRisk(memory: MemoryObject, now: Date): number {
  const last = memory.last_reviewed_at ? new Date(memory.last_reviewed_at) : null;
  const daysSince = last ? Math.max(0, (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)) : 30;
  const timeDecay = Math.min(daysSince * 5, 40);
  const lowMemoryPenalty = Math.max(0, 60 - memory.memory_strength) * 0.5;
  const errorPenalty = memory.incorrect_count > memory.correct_count ? 15 : 0;
  const overduePenalty = memory.next_review_at && now > new Date(memory.next_review_at) ? 20 : 0;
  const confusionPenalty = memory.confusion_targets.length > 0 ? 10 : 0;

  return clamp(timeDecay + lowMemoryPenalty + errorPenalty + overduePenalty + confusionPenalty);
}

export function scheduleNextReview(
  memory: MemoryObject,
  now = new Date(),
  lastEvent?: LearningEvent
): string {
  let days = 1;
  if (memory.memory_strength < 40) days = 1;
  else if (memory.memory_strength < 60) days = 3;
  else if (memory.memory_strength < 75) days = 7;
  else if (memory.memory_strength < 90) days = 14;
  else days = 30;

  // 오답과 혼동은 다음 복습을 앞당겨 장기 기억 손실을 먼저 막는다.
  if (lastEvent?.is_correct === false) days = Math.max(1, Math.floor(days * 0.5));
  if (lastEvent?.error_type === "confusion_error") days = 1;

  const next = new Date(now);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

export function generateDailyRecommendations(
  memoryObjects: MemoryObject[],
  now = new Date(),
  limit = 12
): Recommendation[] {
  return memoryObjects
    .map((memory, index) => {
      const overdueScore = memory.next_review_at && now > new Date(memory.next_review_at) ? 100 : 0;
      const errorSeverity = memory.incorrect_count > memory.correct_count ? 100 : memory.incorrect_count > 0 ? 50 : 0;
      const confusionScore = memory.confusion_targets.length > 0 ? 100 : 0;
      const rawPriorityScore = clamp(
        memory.forgetting_risk * 0.35 +
        (100 - memory.memory_strength) * 0.25 +
        errorSeverity * 0.15 +
        confusionScore * 0.15 +
        overdueScore * 0.10
      );

      const activity_type = selectActivityType(memory, now);
      const priority_score = activity_type === "new_learning"
        ? Math.min(rawPriorityScore, 30)
        : rawPriorityScore;
      const reason = buildRecommendationReason(activity_type, memory, now);

      return {
        recommendation_id: `rec_${String(index + 1).padStart(6, "0")}`,
        learning_object_id: memory.learning_object_id,
        activity_type,
        priority_score,
        reason,
        source_signals: buildSourceSignals(memory, now),
        created_at: now.toISOString(),
      } as Recommendation;
    })
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, limit);
}

function updateAverageLatency(current: number | null, next?: number | null): number | null {
  if (next == null) return current;
  if (current == null) return next;
  return Math.round(current * 0.8 + next * 0.2);
}

function updateConfusionTargets(event: LearningEvent, current: string[]): string[] {
  if (event.error_type !== "confusion_error") return current;
  const target = event.metadata.confusion_target;
  if (typeof target !== "string" || current.includes(target)) return current;
  return [...current, target];
}

function selectActivityType(memory: MemoryObject, now: Date): ActivityType {
  if (memory.confusion_targets.length > 0 || memory.incorrect_count > memory.correct_count) {
    return "contrast";
  }

  if (memory.learning_stage === "exposure" && memory.memory_strength === 0) {
    return "new_learning";
  }

  const isDue = memory.next_review_at == null || now >= new Date(memory.next_review_at);
  if (isDue || memory.forgetting_risk >= 50 || memory.memory_strength < 60) {
    return "review";
  }

  return "hold";
}

function buildRecommendationReason(activityType: ActivityType, memory: MemoryObject, now: Date): string {
  if (activityType === "new_learning") {
    return "아직 추적 중인 기억 이력이 없어, 검증 가능한 새 Learning Object를 소량 도입합니다.";
  }

  if (activityType === "contrast") {
    return "최근 오답 또는 혼동 신호가 있어 비교 학습을 추천합니다.";
  }

  if (memory.next_review_at && now > new Date(memory.next_review_at)) {
    return "복습 예정일이 지나 망각 위험을 낮추기 위해 복습을 추천합니다.";
  }

  if (memory.memory_strength < 40) {
    return "기억 강도가 낮아 직접 회상 전에 안정화 복습을 추천합니다.";
  }

  return "망각 위험과 기억 강도를 기준으로 복습을 추천합니다.";
}

function buildSourceSignals(memory: MemoryObject, now: Date): string[] {
  const signals = ["forgetting_risk", "memory_strength"];

  if (memory.next_review_at && now > new Date(memory.next_review_at)) signals.push("overdue_review");
  if (memory.incorrect_count > 0) signals.push("recent_error");
  if (memory.confusion_targets.length > 0) signals.push("confusion");

  return signals;
}
