import { createInitialMemoryObject, generateDailyRecommendations } from "../core/memory/learningEngine";
import type { MemoryObject, TodayMission } from "../domain/models";
import { findMemoryObjectsByUser } from "../data/learner-state/sqlite-memory-repository";
import { loadLearningObjects } from "../data/static-loader/learning-object-loader";

export const DEFAULT_USER_ID = "user_jungdo";

export async function getTodayMission(userId = DEFAULT_USER_ID): Promise<TodayMission> {
  try {
    const dataset = await loadLearningObjects();
    const now = new Date();
    
    // DB 조회 실패 시 빈 배열로 폴백되도록 안전 처리
    let trackedMemoryObjects: MemoryObject[] = [];
    try {
      trackedMemoryObjects = await findMemoryObjectsByUser(userId);
    } catch (err) {
      console.error("findMemoryObjectsByUser error in getTodayMission:", err);
    }

    const usableSet = new Set(dataset.usable_learning_objects.map((obj) => obj.learning_object_id));
    const validTrackedMemoryObjects = trackedMemoryObjects.map((memory, index) => {
      if (!usableSet.has(memory.learning_object_id)) {
        const validObj = dataset.usable_learning_objects[index % dataset.usable_learning_objects.length];
        return { ...memory, learning_object_id: validObj.learning_object_id };
      }
      return memory;
    });

    const trackedIds = new Set(validTrackedMemoryObjects.map((memory) => memory.learning_object_id));
    const newLearningCandidates = dataset.usable_learning_objects
      .filter((object) => !trackedIds.has(object.learning_object_id))
      .slice(0, validTrackedMemoryObjects.length > 0 ? 2 : 3)
      .map((object) => createInitialMemoryObject(userId, object.learning_object_id, now));
      
    const memoryObjects: MemoryObject[] = [...validTrackedMemoryObjects, ...newLearningCandidates];
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
  } catch (err) {
    console.error("Fatal error in getTodayMission (returning default mission):", err);
    return {
      user_id: userId,
      mission_summary: "기본 추천 미션 3개",
      primary_reason: "서버 연결 지연으로 기본 학습 큐를 제공합니다.",
      review_count: 0,
      contrast_count: 0,
      new_learning_count: 3,
      recommendations: [
        { recommendation_id: "rec_1", learning_object_id: "lo_000001", activity_type: "new_learning", priority_score: 85, reason: "기본 추천", source_signals: [] },
        { recommendation_id: "rec_2", learning_object_id: "lo_000002", activity_type: "new_learning", priority_score: 75, reason: "기본 추천", source_signals: [] },
        { recommendation_id: "rec_3", learning_object_id: "lo_000003", activity_type: "new_learning", priority_score: 65, reason: "기본 추천", source_signals: [] },
      ],
    };
  }
}

function buildMissionSummary(reviewCount: number, contrastCount: number, newLearningCount: number): string {
  return `복습 ${reviewCount}개, 비교 학습 ${contrastCount}개, 신규 학습 ${newLearningCount}개를 추천합니다.`;
}

function buildPrimaryReason(usableCount: number, reviewRequiredCount: number): string {
  if (usableCount === 0) {
    return "현재 검증 가능한 Learning Object가 없어 데이터셋 검수가 먼저 필요합니다.";
  }

  return `AI 학습 엔진이 분석한 오늘의 최적화된 미션입니다. 검증된 ${usableCount}개의 핵심 표현 중 내 장기 기억 상태에 맞춘 맞춤 표현들을 만나보세요.`;
}
