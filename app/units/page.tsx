import Link from "next/link";
import { loadLearningObjects } from "@/src/data/static-loader/learning-object-loader";

interface ExpressionItem {
  id: string;
  expression: string;
}

interface UnitInfo {
  unit: number;
  title: string;
  expressionCount: number;
  expressions: ExpressionItem[];
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
      if (!existing.expressions.some((e) => e.id === obj.learning_object_id)) {
        existing.expressions.push({ id: obj.learning_object_id, expression: obj.expression });
      }
    } else {
      unitMap.set(unitNum, {
        unit: unitNum,
        title: (obj as unknown as { unit_title?: string }).unit_title ?? `Unit ${unitNum}`,
        expressionCount: 1,
        expressions: [{ id: obj.learning_object_id, expression: obj.expression }],
      });
    }
  }

  const units = Array.from(unitMap.values()).sort((a, b) => a.unit - b.unit);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="animate-fade-in">
        <p className="text-xs sm:text-sm font-semibold text-primary">교재 탐색</p>
        <h1 className="mt-1 sm:mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
          Units 📖
        </h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted">
          English Phrasal Verbs in Use Intermediate — 유닛별로 표현을 탐색하고 탭하여 뜻과 예문을 확인하세요.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {units.map((unit, index) => {
          const firstExprId = unit.expressions[0]?.id ?? "";

          return (
            <div
              key={unit.unit}
              className="card-enter group rounded-[20px] sm:rounded-card border border-border bg-white p-4 sm:p-5 shadow-card transition hover:shadow-card-hover hover:border-primary/30 flex flex-col justify-between"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary shadow-xs">
                    {unit.unit}
                  </div>
                  <span className="rounded-badge bg-surface px-2.5 py-1 text-xs font-semibold text-muted shadow-xs">
                    {unit.expressions.length}개 표현
                  </span>
                </div>

                <Link href={`/learning-objects/${firstExprId}`} className="block mt-4">
                  <h3 className="text-base font-bold text-ink group-hover:text-primary transition">
                    {unit.title}
                  </h3>
                </Link>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {unit.expressions.slice(0, 5).map((expr) => (
                    <Link
                      key={expr.id}
                      href={`/learning-objects/${expr.id}`}
                      className="rounded-badge bg-surface px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-primary-soft hover:text-primary hover:font-bold"
                    >
                      {expr.expression}
                    </Link>
                  ))}
                  {unit.expressions.length > 5 ? (
                    <Link
                      href={`/learning-objects/${firstExprId}`}
                      className="rounded-badge bg-primary-soft px-2 py-1 text-xs font-medium text-primary hover:font-bold transition"
                    >
                      +{unit.expressions.length - 5}
                    </Link>
                  ) : null}
                </div>
              </div>

              <Link
                href={`/learning-objects/${firstExprId}`}
                className="mt-5 flex h-10 w-full items-center justify-center rounded-btn bg-surface text-xs font-bold text-ink transition group-hover:bg-primary group-hover:text-white shadow-xs"
              >
                유닛 전체 학습하기 →
              </Link>
            </div>
          );
        })}
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
