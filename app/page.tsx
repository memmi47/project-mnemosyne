import { getTodayMission } from "@/src/services/today-mission-service";
import { getProgressSummary } from "@/src/services/progress-service";
import { loadLearningObjects } from "@/src/data/static-loader/learning-object-loader";
import { HomeClientView } from "@/components/home-client-view";

export default async function HomePage() {
  const mission = await getTodayMission();
  const progress = await getProgressSummary();
  const dataset = await loadLearningObjects();

  // JSON 직렬화 가능한 Map 구조체 변환
  const loMapJson: Record<string, { expression: string; definition_ko: string; unit?: number }> = {};
  dataset.learning_objects.forEach((obj) => {
    loMapJson[obj.learning_object_id] = {
      expression: obj.expression,
      definition_ko: obj.definition_ko,
      unit: (obj as unknown as { unit?: number }).unit,
    };
  });

  const totalAvailable = progress.total_learning_objects;
  const todayTotal = mission.review_count + mission.contrast_count + mission.new_learning_count;

  // AI 큐에 충분한 추천 목록 전달 (기본 추천 목록이 부족할 경우 전체 데이터셋으로 풀 보강)
  let pool = mission.recommendations.map(r => ({
    recommendation_id: r.recommendation_id,
    learning_object_id: r.learning_object_id,
    activity_type: r.activity_type,
    priority_score: r.priority_score,
  }));

  if (pool.length < 50) {
    const existingIds = new Set(pool.map(p => p.learning_object_id));
    for (const obj of dataset.learning_objects) {
      if (pool.length >= 50) break;
      if (!existingIds.has(obj.learning_object_id)) {
        pool.push({
          recommendation_id: `rec_fill_${obj.learning_object_id}`,
          learning_object_id: obj.learning_object_id,
          activity_type: "new_learning",
          priority_score: Math.floor(Math.random() * 20) + 10,
        });
        existingIds.add(obj.learning_object_id);
      }
    }
  }

  return (
    <HomeClientView
      initialTotalAvailable={totalAvailable}
      initialTodayTotal={todayTotal}
      initialMissionSummary={mission.mission_summary}
      recommendationsPool={pool}
      loMapJson={loMapJson}
    />
  );
}
