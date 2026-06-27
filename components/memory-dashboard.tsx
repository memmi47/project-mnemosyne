import type { ProgressSummary } from "@/src/services/progress-service";

interface MemoryDashboardProps {
  progress: ProgressSummary;
}

export function MemoryDashboard({ progress }: MemoryDashboardProps) {
  return (
    <section className="border border-mist bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-moss">Progress Dashboard</p>
        <h1 className="mt-2 text-xl font-semibold text-ink">기억 상태 준비도</h1>
      </div>

      <dl className="mt-6 grid gap-3 md:grid-cols-3">
        <Metric label="전체 Learning Object" value={progress.total_learning_objects} />
        <Metric label="초기 사용 가능" value={progress.usable_learning_objects} />
        <Metric label="검수 대기" value={progress.review_required_objects} />
      </dl>

      <dl className="mt-3 grid gap-3 md:grid-cols-3">
        <Metric label="추적 중인 Memory" value={progress.memory_summary.tracked_objects} />
        <Metric label="평균 Memory Strength" value={progress.memory_summary.average_memory_strength} />
        <Metric label="높은 망각 위험" value={progress.memory_summary.high_forgetting_risk_objects} />
      </dl>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-mist bg-paper p-4">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold text-ink">{value}</dd>
    </div>
  );
}
