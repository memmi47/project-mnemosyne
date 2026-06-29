import { SessionFlow } from "@/components/session-flow";
import { loadLearningObjects } from "@/src/data/static-loader/learning-object-loader";
import { loadQuizTemplates } from "@/src/data/static-loader/quiz-template-loader";
import { getTodayMission } from "@/src/services/today-mission-service";
import type { LearningObject, QuizTemplate, Recommendation } from "@/src/domain/models";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SessionItem {
  recommendation: Recommendation;
  learningObject: LearningObject;
  quizTemplates: QuizTemplate[];
}

interface PageProps {
  searchParams?: Promise<{ mode?: string }>;
}

export default async function SessionPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const mode = params.mode === "starred" ? "starred" : "general";
  const mission = await getTodayMission();
  const allTemplates = await loadQuizTemplates();
  const dataset = await loadLearningObjects();

  // 클라이언트에서 이미 아는 단어(Known) 제외 및 별표(Starred) 매칭을 수월하게 하도록 풀 확장
  const sessionItems: SessionItem[] = [];
  const existingIds = new Set<string>();

  // 1. 미션 추천 목록 우선 삽입
  for (const rec of mission.recommendations) {
    const lo = dataset.learning_objects.find((obj) => obj.learning_object_id === rec.learning_object_id);
    if (!lo || existingIds.has(lo.learning_object_id)) continue;

    const templates = allTemplates.filter((t) => t.learning_object_id === rec.learning_object_id);
    sessionItems.push({ recommendation: rec, learningObject: lo, quizTemplates: templates });
    existingIds.add(lo.learning_object_id);
  }

  // 2. 전체 데이터셋 풀 보강 (최대 100개까지 전달하여 클라이언트 필터링 완벽 보장)
  for (const lo of dataset.learning_objects) {
    if (sessionItems.length >= 100) break;
    if (!existingIds.has(lo.learning_object_id)) {
      const templates = allTemplates.filter((t) => t.learning_object_id === lo.learning_object_id);
      sessionItems.push({
        recommendation: {
          recommendation_id: `rec_fill_${lo.learning_object_id}`,
          learning_object_id: lo.learning_object_id,
          activity_type: "new_learning",
          priority_score: 30,
          reason: "전체 데이터셋 풀 확장",
          source_signals: ["forgetting_risk: 30"],
        },
        learningObject: lo,
        quizTemplates: templates,
      });
      existingIds.add(lo.learning_object_id);
    }
  }

  if (sessionItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-4 text-2xl font-extrabold text-ink">오늘 학습 완료!</h1>
        <p className="mt-2 text-muted">오늘의 학습 목표를 모두 달성했습니다.</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-12 items-center rounded-btn bg-primary px-6 text-sm font-bold text-white shadow-btn transition hover:shadow-btn-hover"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-6">
      <SessionFlow
        mode={mode}
        items={sessionItems.map((item) => ({
          recommendation: item.recommendation,
          learningObject: {
            learning_object_id: item.learningObject.learning_object_id,
            expression: item.learningObject.expression,
            definition_en: item.learningObject.definition_en,
            definition_ko: item.learningObject.definition_ko,
            grammar_pattern: item.learningObject.grammar_pattern,
            examples: item.learningObject.examples,
            base_verb: item.learningObject.base_verb,
            particles: item.learningObject.particles,
            separability: item.learningObject.separability,
            unit: (item.learningObject as unknown as { unit?: number }).unit,
          },
          quizTemplates: item.quizTemplates,
        }))}
      />
    </div>
  );
}
