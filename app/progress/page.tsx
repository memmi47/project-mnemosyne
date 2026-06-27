import { getProgressSummary } from "@/src/services/progress-service";
import Link from "next/link";

export default async function ProgressPage() {
  const progress = await getProgressSummary();

  const total = progress.total_learning_objects;
  const usable = progress.usable_learning_objects;
  const tracked = progress.memory_summary.tracked_objects;
  const avgStrength = Math.round(progress.memory_summary.average_memory_strength);
  const highRisk = progress.memory_summary.high_forgetting_risk_objects;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="animate-fade-in">
        <p className="text-xs sm:text-sm font-semibold text-primary">학습 현황</p>
        <h1 className="mt-1 sm:mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
          Progress 📊
        </h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted">
          전체 학습 진행 상황과 기억 상태를 확인하세요.
        </p>
      </div>

      {/* Overview cards - Optimized for Mobile (2 items in a row) */}
      <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <ProgressCard
          icon="📖"
          label="전체 표현"
          value={total}
          sublabel="데이터셋"
          color="primary"
          delay={0}
        />
        <ProgressCard
          icon="✅"
          label="학습 가능"
          value={usable}
          sublabel="검증 완료"
          color="success"
          delay={1}
        />
        <ProgressCard
          icon="🧠"
          label="추적 중"
          value={tracked}
          sublabel="Memory Object"
          color="primary"
          delay={2}
        />
        <ProgressCard
          icon="⚠️"
          label="망각 위험"
          value={highRisk}
          sublabel="복습 필요"
          color="accent"
          delay={3}
        />
      </div>

      {/* Memory Strength */}
      <div className="mt-6 sm:mt-8 rounded-[20px] sm:rounded-card border border-border bg-white p-5 sm:p-6 shadow-card animate-slide-up">
        <h2 className="text-base sm:text-lg font-bold text-ink">평균 기억 강도</h2>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 self-center sm:self-auto">
            <svg viewBox="0 0 100 100" className="h-20 w-20 sm:h-24 sm:w-24 -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f1f9" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={avgStrength >= 60 ? "#00b894" : avgStrength >= 30 ? "#fdcb6e" : "#fd7062"}
                strokeWidth="8"
                strokeDasharray={`${avgStrength * 2.64} 264`}
                strokeLinecap="round"
                className="animate-progress-fill"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg sm:text-xl font-extrabold text-ink">{avgStrength}%</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm text-muted">
              {avgStrength >= 60
                ? "좋은 상태입니다! 꾸준히 복습을 이어가세요."
                : avgStrength >= 30
                ? "기억이 약해지고 있습니다. 복습을 시작하세요."
                : "기억 강도가 낮습니다. 지금 바로 복습하세요!"}
            </p>
            <Link
              href="/session"
              className="mt-3 inline-flex h-10 items-center rounded-btn bg-primary px-5 text-xs sm:text-sm font-bold text-white shadow-btn transition hover:shadow-btn-hover"
            >
              학습 시작
            </Link>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mt-5 sm:mt-6 rounded-[20px] sm:rounded-card border border-border bg-white p-5 sm:p-6 shadow-card">
        <h2 className="text-base sm:text-lg font-bold text-ink">데이터셋 현황</h2>
        <div className="mt-4 space-y-3">
          <StatBar label="학습 가능 표현" value={usable} max={total} color="bg-success" />
          <StatBar label="검수 대기" value={progress.review_required_objects} max={total} color="bg-warning" />
          <StatBar label="기억 추적 중" value={tracked} max={usable || 1} color="bg-primary" />
        </div>
      </div>
    </div>
  );
}

function ProgressCard({
  icon,
  label,
  value,
  sublabel,
  color,
  delay,
}: {
  icon: string;
  label: string;
  value: number;
  sublabel: string;
  color: "primary" | "success" | "accent";
  delay: number;
}) {
  const textMap = {
    primary: "text-primary",
    success: "text-success",
    accent: "text-accent",
  };

  return (
    <div
      className="card-enter rounded-[20px] sm:rounded-card border border-border bg-white p-4 sm:p-5 shadow-card"
      style={{ animationDelay: `${delay * 80}ms` }}
    >
      <div className="text-xl sm:text-2xl">{icon}</div>
      <p className="mt-2 sm:mt-3 text-[11px] sm:text-xs font-semibold text-muted truncate">{label}</p>
      <p className={`mt-1 text-lg sm:text-2xl font-extrabold ${textMap[color]}`}>{value}</p>
      <p className="mt-0.5 text-[10px] sm:text-xs text-faint truncate">{sublabel}</p>
    </div>
  );
}

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-bold text-muted">{value} / {max}</span>
      </div>
      <div className="mt-1.5 h-2 sm:h-2.5 rounded-full bg-surface overflow-hidden">
        <div
          className={`h-2 sm:h-2.5 rounded-full ${color} animate-progress-fill`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
