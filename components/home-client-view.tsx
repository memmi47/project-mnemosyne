"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLocalProgressSummary, getTrackedRecords } from "@/src/services/local-memory-service";

interface RecommendationData {
  recommendation_id: string;
  learning_object_id: string;
  activity_type: string;
  priority_score: number;
}

interface HomeClientViewProps {
  initialTotalAvailable: number;
  initialTodayTotal: number;
  initialMissionSummary: string;
  recommendationsPool: RecommendationData[];
  loMapJson: Record<string, { expression: string; definition_ko: string; unit?: number }>;
}

export function HomeClientView({
  initialTotalAvailable,
  initialTodayTotal,
  initialMissionSummary,
  recommendationsPool,
  loMapJson,
}: HomeClientViewProps) {
  const [isClient, setIsClient] = useState(false);
  const [totalLearned, setTotalLearned] = useState(0);
  const [avgMemoryStrength, setAvgMemoryStrength] = useState(0);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [activeQueue, setActiveQueue] = useState<RecommendationData[]>(() => recommendationsPool.slice(0, 8));
  const [todayLearningCount, setTodayLearningCount] = useState(initialTodayTotal);

  useEffect(() => {
    setIsClient(true);
    // 1. LocalStorage 실시간 통계 연동
    const summary = getLocalProgressSummary();
    const records = summary.records;
    const tracked = summary.tracked_objects;

    setTotalLearned(tracked);
    setAvgMemoryStrength(summary.average_memory_strength);
    setHighRiskCount(summary.high_forgetting_risk_objects);

    // 오늘 학습할 개수 동적 계산 (최소 기본 수치 보장)
    const activeCount = Math.max(initialTodayTotal, tracked > 0 ? Math.min(tracked + 3, 15) : initialTodayTotal);
    setTodayLearningCount(activeCount);

    // 2. AI 맞춤 학습 큐 동적 하이브리드 정렬 (공부한 내용 실시간 반영)
    const trackedMap = new Map(records.map(r => [r.learning_object_id, r]));

    // 복습이 필요한 항목 (이미 공부했고 망각 위험도가 높은 순)
    const reviewQueue = recommendationsPool
      .filter(rec => trackedMap.has(rec.learning_object_id))
      .map(rec => {
        const r = trackedMap.get(rec.learning_object_id)!;
        return {
          ...rec,
          activity_type: r.forgetting_risk >= 50 ? "review" : "contrast",
          priority_score: r.forgetting_risk, // 망각 위험도를 우선도로 실시간 반영
        };
      })
      .sort((a, b) => b.priority_score - a.priority_score);

    // 아직 공부하지 않은 신규 항목
    const newQueue = recommendationsPool
      .filter(rec => !trackedMap.has(rec.learning_object_id))
      .map(rec => ({ ...rec, activity_type: "new_learning" }));

    // 복습 대상과 신규 대상을 스마트하게 배합하여 최종 8개 큐 완성
    const combined = [...reviewQueue, ...newQueue].slice(0, 8);
    if (combined.length > 0) {
      setActiveQueue(combined);
    }
  }, [recommendationsPool, initialTodayTotal]);

  const completionPercent = initialTotalAvailable > 0 ? Math.round((totalLearned / initialTotalAvailable) * 100) : 0;

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-5 sm:py-10 w-full overflow-x-hidden box-border">
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
          AI 학습 엔진이 분석한 오늘의 최적화된 미션입니다. 검증된 <strong className="text-ink">{initialTotalAvailable}개</strong>의 핵심 표현 중 내 장기 기억 상태에 맞춘 맞춤 표현들을 만나보세요.
        </p>
      </div>

      {/* Stats cards - 사용자 요청 완벽 원복 및 실시간 통계 100% 동기화 (무조건 한 줄에 3개 표시 + min-w-0 적용) */}
      <div className="relative z-10 mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4 w-full box-border">
        <StatCard
          label="오늘 학습"
          value={`${isClient ? todayLearningCount : initialTodayTotal}개`}
          sublabel={initialMissionSummary}
          color="primary"
          delay={0}
        />
        <StatCard
          label="진행률"
          value={`${isClient ? completionPercent : 0}%`}
          sublabel={`${isClient ? totalLearned : 0} / ${initialTotalAvailable} 추적`}
          color="success"
          delay={1}
        />
        <StatCard
          label="기억 강도"
          value={`${isClient ? avgMemoryStrength : 0}%`}
          sublabel={`위험 ${isClient ? highRiskCount : 0}개`}
          color="accent"
          delay={2}
        />
      </div>

      {/* Hero CTA */}
      {todayLearningCount > 0 ? (
        <div className="relative z-10 mt-8 sm:mt-10 animate-slide-up w-full box-border">
          <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-gradient-to-r from-primary-dark via-primary to-primary-light p-6 sm:p-10 shadow-hero transition-all duration-300 hover:shadow-hero-hover hover:-translate-y-1">
            <div className="relative z-10 max-w-lg">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] sm:text-xs font-bold tracking-wider text-white backdrop-blur-md">
                AI MISSION · 추천 미션
              </span>
              <h2 className="mt-3 text-xl sm:text-3xl font-extrabold leading-snug text-white">
                {initialMissionSummary}
              </h2>
              <p className="mt-1.5 text-xs sm:text-base text-white/90">
                새로운 표현을 배우고, 기억 속 표현을 실시간으로 복습하세요.
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
      {activeQueue.length > 0 ? (
        <div className="relative z-10 mt-10 sm:mt-12 w-full box-border">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border pb-4 sm:pb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-ink">
                AI 맞춤 학습 큐 <span className="text-faint font-bold text-sm sm:text-base ml-1">Today&apos;s Queue</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1">
                내 장기 기억 전환을 위해 오늘 우선적으로 학습하고 복습해야 할 추천 표현 목록입니다. 공부할 때마다 실시간 갱신됩니다.
              </p>
            </div>
            <span className="rounded-full bg-primary-soft px-3.5 py-1 sm:px-4 sm:py-1.5 text-xs font-bold text-primary self-start sm:self-auto shadow-sm">
              {activeQueue.length}개 대기 중
            </span>
          </div>

          <div className="mt-5 sm:mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 w-full box-border">
            {activeQueue.map((rec, index) => {
              const lo = loMapJson[rec.learning_object_id];
              const expression = lo ? lo.expression : rec.learning_object_id;
              const meaning = lo ? lo.definition_ko : "";
              const unitNum = lo ? lo.unit : null;

              return (
                <Link
                  key={`${rec.recommendation_id}_${index}`}
                  href={`/learning-objects/${rec.learning_object_id}`}
                  className="card-enter flex items-center gap-3 sm:gap-4 rounded-[20px] sm:rounded-card border border-border bg-white p-4 sm:p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-primary/40 hover:-translate-y-1 active:scale-[0.98] min-w-0 w-full box-border"
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
                    <div className="mt-1.5 sm:mt-2 flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-faint truncate">
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
      className="card-enter relative overflow-hidden rounded-[20px] sm:rounded-card border border-border bg-white p-2.5 sm:p-6 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 min-w-0 w-full box-border"
      style={{ animationDelay: `${delay * 80}ms` }}
    >
      <div className="flex items-center gap-1 sm:gap-3 min-w-0">
        <div className={`h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 rounded-full flex-shrink-0 ${bgMap[color]}`}>
          <div className={`h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 rounded-full ${textMap[color]} bg-current animate-pulse-soft`} />
        </div>
        <p className="text-[10px] sm:text-xs font-bold text-muted truncate min-w-0">{label}</p>
      </div>
      <p className={`mt-1.5 sm:mt-4 text-sm sm:text-3xl font-extrabold tracking-tight ${textMap[color]} truncate`}>{value}</p>
      <p className="mt-1 sm:mt-2 text-[9px] sm:text-xs font-medium text-muted truncate">{sublabel}</p>
      <div className={`absolute -right-6 -top-6 h-16 w-16 sm:h-24 sm:w-24 rounded-full ${bgMap[color]} opacity-50 pointer-events-none`} />
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
    <span className={`rounded-badge px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-extrabold shadow-sm flex-shrink-0 ${styles[level]}`}>
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
