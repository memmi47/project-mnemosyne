import { createInitialMemoryObject, generateDailyRecommendations } from "../core/memory/learningEngine";
import type { MemoryObject, TodayMission } from "../domain/models";
import { findMemoryObjectsByUser } from "../data/learner-state/sqlite-memory-repository";
import { loadLearningObjects } from "../data/static-loader/learning-object-loader";

export const DEFAULT_USER_ID = "user_jungdo";

export async function getTodayMission(userId = DEFAULT_USER_ID): Promise<TodayMission> {
  const dataset = await loadLearningObjects();
  const now = new Date();
  const trackedMemoryObjects = await findMemoryObjectsByUser(userId);
  const trackedIds = new Set(trackedMemoryObjects.map((memory) => memory.learning_object_id));
  const newLearningCandidates = dataset.usable_learning_objects
    .filter((object) => !trackedIds.has(object.learning_object_id))
    .slice(0, trackedMemoryObjects.length > 0 ? 2 : 3)
    .map((object) => createInitialMemoryObject(userId, object.learning_object_id, now));
  const memoryObjects: MemoryObject[] = [...trackedMemoryObjects, ...newLearningCandidates];
  const recommendations = generateDailyRecommendations(memoryObjects, now, 12)
    .filter((recommendation) => recommendation.activity_type !== "hold");
  const reviewCount = recommendations.filter((item) => item.activity_type === "review").length;
  const contrastCount = recommendations.filter((item) => item.activity_type === "contrast").length;
  const newLearningCount = recommendations.filter((item) => item.activity_type === "new_learning").length;

  return {
    user_id: userId,
    mission_summary: buildMissionSummary(reviewCount, contrastCount, newLearningCount),
    primary_reason: buildPrimaryReason(dataset.validation.usable_count, dataset.validation.review_required_count),
    review_count: reviewCount,
    contrast_count: contrastCount,
    new_learning_count: newLearningCount,
    recommendations,
  };
}

function buildMissionSummary(reviewCount: number, contrastCount: number, newLearningCount: number): string {
  return `복습 ${reviewCount}개, 비교 학습 ${contrastCount}개, 신규 학습 ${newLearningCount}개를 추천합니다.`;
}

function buildPrimaryReason(usableCount: number, reviewRequiredCount: number): string {
  if (usableCount === 0) {
    return "현재 검증 가능한 Learning Object가 없어 데이터셋 검수가 먼저 필요합니다.";
  }

  return `현재 사용 가능한 Learning Object ${usableCount}개를 기준으로 시작합니다. 전체 ${reviewRequiredCount}개 객체는 OCR 검수 대기 상태이므로, 검증된 정의가 있는 항목만 초기 Mission에 포함합니다.`;
}
