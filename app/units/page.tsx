import Link from "next/link";
import { loadLearningObjects } from "@/src/data/static-loader/learning-object-loader";

interface UnitInfo {
  unit: number;
  title: string;
  expressionCount: number;
  expressions: string[];
}

export default async function UnitsPage() {
  const dataset = await loadLearningObjects();
  const unitMap = new Map<number, UnitInfo>();

  for (const obj of dataset.learning_objects) {
    const unitNum = (obj as unknown as { unit?: number }).unit;
    if (!unitNum) continue;
    const existing = unitMap.get(unitNum);
    if (existing) {
      existing.expressionCount++;
      if (!existing.expressions.includes(obj.expression)) {
        existing.expressions.push(obj.expression);
      }
    } else {
      unitMap.set(unitNum, {
        unit: unitNum,
        title: (obj as unknown as { unit_title?: string }).unit_title ?? `Unit ${unitNum}`,
        expressionCount: 1,
        expressions: [obj.expression],
      });
    }
  }

  const units = Array.from(unitMap.values()).sort((a, b) => a.unit - b.unit);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="animate-fade-in">
        <p className="text-sm font-semibold text-primary">교재 탐색</p>
        <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
          Units 📖
        </h1>
        <p className="mt-2 text-sm text-muted">
          English Phrasal Verbs in Use Intermediate — 유닛별로 표현을 탐색하세요.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {units.map((unit, index) => (
          <div
            key={unit.unit}
            className="card-enter group rounded-card border border-border bg-white p-5 shadow-card transition hover:shadow-card-hover hover:border-primary/30"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                {unit.unit}
              </div>
              <span className="rounded-badge bg-surface px-2.5 py-1 text-xs font-semibold text-muted">
                {unit.expressions.length}개 표현
              </span>
            </div>

            <h3 className="mt-4 text-base font-bold text-ink group-hover:text-primary transition">
              {unit.title}
            </h3>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {unit.expressions.slice(0, 5).map((expr) => (
                <span
                  key={expr}
                  className="rounded-badge bg-surface px-2 py-0.5 text-xs font-medium text-muted"
                >
                  {expr}
                </span>
              ))}
              {unit.expressions.length > 5 ? (
                <span className="rounded-badge bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                  +{unit.expressions.length - 5}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {units.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg font-bold text-muted">아직 로드된 유닛이 없습니다.</p>
          <p className="mt-2 text-sm text-faint">데이터셋을 확인해주세요.</p>
        </div>
      ) : null}
    </div>
  );
}
