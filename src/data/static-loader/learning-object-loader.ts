import { readFile } from "node:fs/promises";
import path from "node:path";
import type { LearningObject } from "../../domain/models";

const DATASET_PATH = path.join(process.cwd(), "dataset", "static", "learning_objects_verified.json");

export interface LearningObjectValidationSummary {
  total_count: number;
  usable_count: number;
  review_required_count: number;
  missing_definition_count: number;
  missing_examples_count: number;
}

export interface LearningObjectLoadResult {
  learning_objects: LearningObject[];
  usable_learning_objects: LearningObject[];
  validation: LearningObjectValidationSummary;
}

let cachedResult: LearningObjectLoadResult | null = null;

export async function loadLearningObjects(): Promise<LearningObjectLoadResult> {
  if (cachedResult) return cachedResult;

  const file = await readFile(DATASET_PATH, "utf-8");
  const parsed: unknown = JSON.parse(file);

  if (!Array.isArray(parsed)) {
    throw new Error("learning_objects.json must contain an array.");
  }

  const learningObjects = parsed.map(normalizeLearningObject);
  const usableLearningObjects = learningObjects.filter(isUsableForMvp);

  cachedResult = {
    learning_objects: learningObjects,
    usable_learning_objects: usableLearningObjects,
    validation: {
      total_count: learningObjects.length,
      usable_count: usableLearningObjects.length,
      review_required_count: learningObjects.filter((object) => object.status === "review_required").length,
      missing_definition_count: learningObjects.filter(
        (object) => object.definition_en.length === 0 && object.definition_ko.length === 0
      ).length,
      missing_examples_count: learningObjects.filter((object) => countContentExamples(object) === 0).length,
    },
  };

  return cachedResult;
}

export async function findLearningObjectById(id: string): Promise<LearningObject | null> {
  const result = await loadLearningObjects();
  return result.learning_objects.find((object) => object.learning_object_id === id) ?? null;
}

function normalizeLearningObject(value: unknown): LearningObject {
  if (!isRecord(value)) {
    throw new Error("Invalid learning object row.");
  }

  return {
    learning_object_id: readString(value, "learning_object_id"),
    expression: readString(value, "expression"),
    sense_id: readString(value, "sense_id"),
    base_verb: readString(value, "base_verb"),
    particles: readStringArray(value.particles),
    definition_en: readString(value, "definition_en"),
    definition_ko: readString(value, "definition_ko"),
    grammar_pattern: readString(value, "grammar_pattern"),
    separability: readEnum(value.separability, ["separable", "inseparable", "not_applicable", "unknown"], "unknown"),
    transitivity: readEnum(value.transitivity, ["transitive", "intransitive", "both", "unknown"], "unknown"),
    examples: Array.isArray(value.examples) ? value.examples as LearningObject["examples"] : [],
    semantic_tags: readStringArray(value.semantic_tags),
    context_tags: readStringArray(value.context_tags),
    confusing_objects: readStringArray(value.confusing_objects),
    source_references: Array.isArray(value.source_references) ? value.source_references as LearningObject["source_references"] : [],
    status: readEnum(value.status, ["raw", "normalized", "review_required", "verified", "released"], "review_required"),
    content_version: readOptionalString(value, "content_version"),
    examples_v3: isRecord(value.examples_v3)
      ? value.examples_v3 as unknown as LearningObject["examples_v3"]
      : undefined,
    exercises_v3: Array.isArray(value.exercises_v3)
      ? value.exercises_v3 as unknown as LearningObject["exercises_v3"]
      : [],
    common_mistakes: Array.isArray(value.common_mistakes)
      ? value.common_mistakes as unknown as LearningObject["common_mistakes"]
      : [],
    hints: Array.isArray(value.hints) ? value.hints as unknown as LearningObject["hints"] : [],
    learning_path: readStringArray(value.learning_path) as LearningObject["learning_path"],
    content_completeness: isRecord(value.content_completeness)
      ? value.content_completeness as unknown as LearningObject["content_completeness"]
      : undefined,
    unit: typeof value.unit === "number" ? value.unit : undefined,
    unit_title: readOptionalString(value, "unit_title"),
  } as LearningObject & { unit?: number; unit_title?: string };
}

// MVP에서는 정의가 있는 객체만 문제 생성 후보로 삼아 OCR 노이즈를 학습 루프에 밀어 넣지 않는다.
function isUsableForMvp(object: LearningObject): boolean {
  return object.expression.length > 0 && (object.definition_ko.length > 0 || object.definition_en.length > 0);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function readOptionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function readEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? value as T : fallback;
}

function countContentExamples(object: LearningObject): number {
  return object.examples.length +
    (object.examples_v3?.book_examples.length ?? 0) +
    (object.examples_v3?.generated_examples.length ?? 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
