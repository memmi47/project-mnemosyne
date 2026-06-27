import type { TodayMission } from "@/src/domain/models";
import Link from "next/link";

interface TodayMissionCardProps {
  mission: TodayMission;
}

export function TodayMissionCard({ mission }: TodayMissionCardProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="border border-mist bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              오늘의 추천 이유
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-normal text-ink">
              {mission.mission_summary}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {mission.primary_reason}
            </p>
          </div>

          <Link
            className="inline-flex h-11 items-center justify-center bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-dark"
            href="/session"
          >
            시작
          </Link>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="복습" value={mission.review_count} tone="primary" />
          <Metric label="비교 학습" value={mission.contrast_count} tone="accent" />
          <Metric label="신규 학습" value={mission.new_learning_count} tone="primary" />
        </dl>
      </div>

      <div className="border border-mist bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Mission Queue
            </p>
            <h3 className="mt-2 text-lg font-bold text-ink">우선순위</h3>
          </div>
          <Link className="text-sm font-bold text-primary" href="/progress">
            Progress
          </Link>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {mission.recommendations.map((recommendation, index) => (
            <RecommendationRow
              key={recommendation.recommendation_id}
              index={index + 1}
              label={recommendation.learning_object_id}
              type={recommendation.activity_type}
              score={recommendation.priority_score}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: "primary" | "accent" }) {
  const toneClass = tone === "accent" ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary";

  return (
    <div className="border border-mist bg-paper p-4">
      <dt className="text-xs font-bold text-muted">{label}</dt>
      <dd className="mt-3 flex items-end justify-between gap-3">
        <span className="text-3xl font-black text-ink">{value}</span>
        <span className={`h-8 min-w-8 px-2 text-center text-sm font-bold leading-8 ${toneClass}`}>
          {value > 0 ? "ON" : "0"}
        </span>
      </dd>
    </div>
  );
}

function RecommendationRow({
  index,
  label,
  type,
  score,
}: {
  index: number;
  label: string;
  type: string;
  score: number;
}) {
  const width = `${Math.max(8, Math.round(score))}%`;

  return (
    <div className="border border-mist bg-paper p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-faint">#{index} · {type}</p>
          <p className="mt-1 truncate text-sm font-bold text-ink">{label}</p>
        </div>
        <span className="text-sm font-black text-primary">{Math.round(score)}</span>
      </div>
      <div className="mt-3 h-2 bg-mist">
        <div className="h-2 bg-primary" style={{ width }} />
      </div>
    </div>
  );
}
