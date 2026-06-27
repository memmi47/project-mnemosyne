import { QuizCard } from "@/components/quiz-card";
import { findMemoryObject } from "@/src/data/learner-state/sqlite-memory-repository";
import { findLearningObjectById } from "@/src/data/static-loader/learning-object-loader";
import {
  findQuizTemplateForObject,
  findQuizTemplatesForObject,
} from "@/src/data/static-loader/quiz-template-loader";
import { DEFAULT_USER_ID, getTodayMission } from "@/src/services/today-mission-service";
import Link from "next/link";

export default async function SessionPage() {
  const mission = await getTodayMission();
  const firstRecommendation = mission.recommendations[0] ?? null;
  const initialMemory = firstRecommendation
    ? await findMemoryObject(DEFAULT_USER_ID, firstRecommendation.learning_object_id)
    : null;
  const learningObject = firstRecommendation
    ? await findLearningObjectById(firstRecommendation.learning_object_id)
    : null;
  const quizTemplate = firstRecommendation
    ? await findQuizTemplateForObject(firstRecommendation.learning_object_id, firstRecommendation.activity_type)
    : null;
  const quizTemplates = firstRecommendation
    ? await findQuizTemplatesForObject(firstRecommendation.learning_object_id)
    : [];

  return (
    <main className="min-h-screen bg-paper px-5 py-6 md:px-8 md:py-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <Link className="text-sm font-bold text-primary" href="/">
          Today Mission
        </Link>
        <QuizCard
          initialMemory={initialMemory}
          learningObject={learningObject}
          quizTemplate={quizTemplate}
          quizTemplates={quizTemplates}
          recommendation={firstRecommendation}
        />
      </section>
    </main>
  );
}
