import { LearningObjectDetail } from "@/components/learning-object-detail";
import { loadLearningObjects } from "@/src/data/static-loader/learning-object-loader";
import { PwaNavLink } from "@/components/pwa-nav-link";
import { notFound } from "next/navigation";

interface LearningObjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LearningObjectPage({ params }: LearningObjectPageProps) {
  const { id } = await params;
  const dataset = await loadLearningObjects();
  const objects = dataset.learning_objects;

  const currentIndex = objects.findIndex((obj) => obj.learning_object_id === id);
  if (currentIndex === -1) notFound();

  const currentObject = objects[currentIndex];
  const prevObject = currentIndex > 0 ? objects[currentIndex - 1] : null;
  const nextObject = currentIndex < objects.length - 1 ? objects[currentIndex + 1] : null;

  return (
    <main className="relative min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      {/* Floating background decor */}
      <div className="pointer-events-none absolute -left-10 -top-10 z-0 h-72 w-72 rounded-full bg-radial from-primary-light/15 to-transparent blur-xl animate-mn-float" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-6">
        {/* Top bar navigation */}
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <PwaNavLink
              href="/"
              className="inline-flex h-9 items-center rounded-btn bg-surface px-3.5 text-xs sm:text-sm font-bold text-muted transition hover:bg-primary-soft hover:text-primary shadow-xs"
            >
              ← 맞춤 학습 큐
            </PwaNavLink>
            <PwaNavLink
              href="/units"
              className="inline-flex h-9 items-center rounded-btn bg-surface px-3.5 text-xs sm:text-sm font-bold text-muted transition hover:bg-primary-soft hover:text-primary shadow-xs"
            >
              📖 유닛 교재 탐색
            </PwaNavLink>
          </div>
          <span className="text-xs font-bold text-faint hidden sm:inline">
            학습 표현 상세
          </span>
        </div>

        {/* Main detail content (Expression & Examples) */}
        <LearningObjectDetail learningObject={currentObject} />

        {/* Next & Previous Navigation Buttons (Seamless Unit Crawling) */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
          {prevObject ? (
            <PwaNavLink
              href={`/learning-objects/${prevObject.learning_object_id}`}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-[20px] border border-border bg-white px-6 py-4 shadow-card transition hover:shadow-card-hover hover:border-primary/40 active:scale-[0.98]"
            >
              <span className="text-xs font-bold text-muted">← 이전 표현</span>
              <span className="text-sm sm:text-base font-extrabold text-ink truncate">
                {prevObject.expression}
              </span>
            </PwaNavLink>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextObject ? (
            <PwaNavLink
              href={`/learning-objects/${nextObject.learning_object_id}`}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-primary to-accent px-8 py-4 shadow-btn transition hover:shadow-btn-hover active:scale-[0.98] text-white"
            >
              <span className="text-sm sm:text-base font-extrabold truncate">
                {nextObject.expression}
              </span>
              <span className="text-xs font-bold text-white/90">다음 표현 →</span>
            </PwaNavLink>
          ) : (
            <div className="flex w-full sm:w-auto items-center justify-center rounded-[20px] bg-success px-8 py-4 text-sm font-extrabold text-white shadow-btn">
              유닛 마지막 표현입니다 🎉
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
