import type { LearningObject } from "@/src/domain/models";

interface LearningObjectDetailProps {
  learningObject: LearningObject;
}

export function LearningObjectDetail({ learningObject }: LearningObjectDetailProps) {
  return (
    <section className="border border-mist bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-moss">{learningObject.learning_object_id}</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">{learningObject.expression}</h1>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        {learningObject.definition_ko || learningObject.definition_en || "정의 검수가 필요합니다."}
      </p>
      <dl className="mt-6 grid gap-3 md:grid-cols-2">
        <Meta label="Stage Source" value="Learning Object" />
        <Meta label="Status" value={learningObject.status} />
        <Meta label="Grammar" value={learningObject.grammar_pattern || "검수 필요"} />
        <Meta label="Base Verb" value={learningObject.base_verb} />
      </dl>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-mist bg-paper p-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}
