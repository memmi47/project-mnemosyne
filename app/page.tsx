import Link from "next/link";
import { getTodayMission } from "@/src/services/today-mission-service";
import { getProgressSummary } from "@/src/services/progress-service";
import { loadLearningObjects } from "@/src/data/static-loader/learning-object-loader";

export default async function HomePage() {
  const mission = await getTodayMission();
  const progress = await getProgressSummary();
  const dataset = await loadLearningObjects();

  const loMap = new Map(dataset.learning_objects.map((obj) => [obj.learning_object_id, obj]));

  const totalLearned = progress.memory_summary.tracked_objects;
  const totalAvailable = progress.total_learning_objects;
  const completionPercent = totalAvailable > 0 ? Math.round((totalLearned / totalAvailable) * 100) : 0;
  const todayTotal = mission.review_count + mission.contrast_count + mission.new_learning_count;

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-5 sm:py-10 w-full overflow-x-hidden">
      {/* Background floating decor */}
      <div className="pointer-events-none absolute -left-20 -top-20 z-0 h-80 w-80 rounded-full bg-radial from-primary-light/20 to-transparent blur-xl animate-mn-float" />
      <div className="pointer-events-none absolute -right-16 bottom-0 z-0 h-96 w-96 rounded-full bg-radial from-accent/15 to-transparent blur-xl animate-mn-float2" />

      {/* Welcome section */}
      <div className="relative z-10 animate-fade-in">
        <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 sm:px-4 sm:py-1.5 text-xs font-bold tracking-wider text-primary">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
          오늘의 학습 · TODAY
        </p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:mt-4 sm:text-4xl">
          Phrasal Verbs <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">마스터하기</span> ✨
        </h1>
        <p className="mt-2 max-w-2xl text-sm sm:text-base leading-relaxed text-muted">
          AI 학습 엔진이 분석한 오늘의 최적화된 미션입니다. 검증된 <strong className="text-ink">{totalAvailable}개</strong>의 핵심 표현 중 내 장기 기억 상태에 맞춘 맞춤 표현들을 만나보세요.
        </p>
      </div>

      {/* Stats cards - Optimized for Mobile (3 items in one row) */}
      <div className="relative z-10 mt-6 sm:mt-8 grid grid-cols-3 gap-2.5 sm:gap-4">
        <StatCard
          label="오늘 학습"
          value={`${todayTotal}개`}
          sublabel={mission.mission_summary}
          color="primary"
          delay={0}
        />
        <StatCard
          label="진행률"
          value={`${completionPercent}%`}
          sublabel={`${totalLearned} / ${totalAvailable} 추적 중`}
          color="success"
          delay={1}
        />
        <StatCard
          label="기억 강도"
          value={`${Math.round(progress.memory_summary.average_memory_strength)}%`}
          sublabel={`망각 위험 ${progress.memory_summary.high_forgetting_risk_objects}개`}
          color="accent"
          delay={2}
        />
      </div>

      {/* Hero CTA */}
      {todayTotal > 0 ? (
        <div className="relative z-10 mt-8 sm:mt-10 animate-slide-up">
          <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-gradient-to-r from-primary-dark via-primary to-primary-light p-6 sm:p-10 shadow-hero transition-all duration-300 hover:shadow-hero-hover hover:-translate-y-1">
            <div className="relative z-10 max-w-lg">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] sm:text-xs font-bold tracking-wider text-white backdrop-blur-md">
                AI MISSION · 추천 미션
              </span>
              <h2 className="mt-3 text-xl sm:text-3xl font-extrabold leading-snug text-white">
                {mission.mission_summary}
              </h2>
              <p className="mt-1.5 text-xs sm:text-base text-white/90">
                새로운 표현을 배우고, 기억 속 표현을 복습하세요.
              </p>
              <Link
                href="/session"
                className="mt-5 inline-flex h-11 sm:h-12 items-center gap-2 rounded-btn bg-white px-6 sm:px-8 text-sm sm:text-base font-extrabold text-primary shadow-btn transition hover:shadow-btn-hover hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                학습 시작하기
              </Link>
            </div>

            {/* Sheen effect & decorative shapes */}
            <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-mn-sheen pointer-events-none" />
            <div className="absolute -right-10 -top-10 h-40 sm:h-52 w-40 sm:w-52 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-16 right-10 sm:right-20 h-32 sm:h-40 w-32 sm:w-40 rounded-full bg-white/5 pointer-events-none" />
          </div>
        </div>
      ) : null}

      {/* Mission queue */}
      {mission.recommendations.length > 0 ? (
        <div className="relative z-10 mt-10 sm:mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border pb-4 sm:pb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-ink">
                AI 맞춤 학습 큐 <span className="text-faint font-bold text-sm sm:text-base ml-1">Today&apos;s Queue</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1">
                내 장기 기억 전환을 위해 오늘 우선적으로 학습하고 복습해야 할 추천 표현 목록입니다. 탭하여 상세 내용을 확인하세요.
              </p>
            </div>
            <span className="rounded-full bg-primary-soft px-3.5 py-1 sm:px-4 sm:py-1.5 text-xs font-bold text-primary self-start sm:self-auto shadow-sm">
              {mission.recommendations.length}개 대기 중
            </span>
          </div>

          <div className="mt-5 sm:mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2">
            {mission.recommendations.slice(0, 8).map((rec, index) => {
              const lo = loMap.get(rec.learning_object_id) ?? dataset.learning_objects[index % dataset.learning_objects.length];
              const expression = lo ? lo.expression : rec.learning_object_id;
              const meaning = lo ? lo.definition_ko : "";
              const unitNum = lo ? (lo as unknown as { unit?: number }).unit : null;

              return (
                <Link
                  key={rec.recommendation_id}
                  href={`/learning-objects/${rec.learning_object_id}`}
                  className="card-enter flex items-center gap-3 sm:gap-4 rounded-[20px] sm:rounded-card border border-border bg-white p-4 sm:p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-primary/40 hover:-translate-y-1 active:scale-[0.98]"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-btn bg-gradient-to-br from-primary-soft to-primary-light/20 text-sm sm:text-base font-extrabold text-primary shadow-sm">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm sm:text-base font-extrabold text-ink">
                        {expression}
                      </p>
                      {unitNum ? (
                        <span className="rounded-badge bg-surface px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-muted shadow-xs">
                          Unit {unitNum}
                        </span>
                      ) : null}
                    </div>
                    {meaning ? (
                      <p className="truncate text-[11px] sm:text-xs font-medium text-muted mt-0.5 sm:mt-1">
                        {meaning}
                      </p>
                    ) : null}
                    <div className="mt-1.5 sm:mt-2 flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-faint">
                      <span className="text-primary">{getActivityLabel(rec.activity_type)}</span>
                      <span>·</span>
                      <span>우선도 {Math.round(rec.priority_score)}</span>
                    </div>
                  </div>
                  <PriorityBadge score={rec.priority_score} />
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  color,
  delay,
}: {
  label: string;
  value: string;
  sublabel: string;
  color: "primary" | "success" | "accent";
  delay: number;
}) {
  const bgMap = {
    primary: "bg-primary-soft",
    success: "bg-success-soft",
    accent: "bg-accent-soft",
  };
  const textMap = {
    primary: "text-primary",
    success: "text-success",
    accent: "text-accent",
  };

  return (
    <div
      className="card-enter relative overflow-hidden rounded-[20px] sm:rounded-card border border-border bg-white p-3.5 sm:p-6 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1"
      style={{ animationDelay: `${delay * 80}ms` }}
    >
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${bgMap[color]}`}>
          <div className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${textMap[color]} bg-current animate-pulse-soft`} />
        </div>
        <p className="text-[11px] sm:text-xs font-bold text-muted truncate">{label}</p>
      </div>
      <p className={`mt-2 sm:mt-4 text-lg sm:text-3xl font-extrabold tracking-tight ${textMap[color]}`}>{value}</p>
      <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-muted line-clamp-2 sm:line-clamp-1">{sublabel}</p>
      <div className={`absolute -right-6 -top-6 h-20 w-20 sm:h-24 sm:w-24 rounded-full ${bgMap[color]} opacity-50 pointer-events-none`} />
    </div>
  );
}

function PriorityBadge({ score }: { score: number }) {
  const level = score >= 70 ? "high" : score >= 40 ? "mid" : "low";
  const styles = {
    high: "bg-accent-soft text-accent",
    mid: "bg-warning-soft text-warning-dark",
    low: "bg-success-soft text-success",
  };

  return (
    <span className={`rounded-badge px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-extrabold shadow-sm ${styles[level]}`}>
      {Math.round(score)}
    </span>
  );
}

function getActivityLabel(activityType: string): string {
  const labels: Record<string, string> = {
    review: "🔄 복습",
    new_learning: "✨ 신규",
    contrast: "⚖️ 비교",
    recognition: "인식",
    retrieval: "회상",
    fill_blank: "빈칸",
    context_choice: "문맥",
    sentence_production: "작문",
    conversation_turn: "대화",
  };
  return labels[activityType] ?? activityType;
}
