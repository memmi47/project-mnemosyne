import { loadLearningObjects } from "@/src/data/static-loader/learning-object-loader";
import { UnitsClientView } from "@/components/units-client-view";

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

export const dynamic = "force-dynamic";

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

  return <UnitsClientView units={units} />;
}
