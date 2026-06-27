import { SessionFlow } from "@/components/session-flow";
import { findMemoryObjectsByUser } from "@/src/data/learner-state/sqlite-memory-repository";
import { loadLearningObjects } from "@/src/data/static-loader/learning-object-loader";
import { loadQuizTemplates } from "@/src/data/static-loader/quiz-template-loader";
import { DEFAULT_USER_ID, getTodayMission } from "@/src/services/today-mission-service";
import type { LearningObject, QuizTemplate, Recommendation } from "@/src/domain/models";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SessionItem {
  recommendation: Recommendation;
  learningObject: LearningObject;
  quizTemplates: QuizTemplate[];
}

export default async function SessionPage() {
  const mission = await getTodayMission();
  const allTemplates = await loadQuizTemplates();
  const dataset = await loadLearningObjects();

  // Build session items (up to 8 items)
  const sessionItems: SessionItem[] = [];

  for (const rec of mission.recommendations.slice(0, 8)) {
    const lo = dataset.learning_objects.find(
      (obj) => obj.learning_object_id === rec.learning_object_id
    );
    if (!lo) continue;

    const templates = allTemplates.filter(
      (t) => t.learning_object_id === rec.learning_object_id
    );

    sessionItems.push({
      recommendation: rec,
      learningObject: lo,
      quizTemplates: templates,
    });
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
          },
          quizTemplates: item.quizTemplates,
        }))}
      />
    </div>
  );
}
