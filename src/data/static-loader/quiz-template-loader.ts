import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ActivityType, QuizTemplate } from "../../domain/models";

const QUIZ_TEMPLATE_PATH = path.join(process.cwd(), "dataset", "templates", "quiz_templates_verified.json");

let cachedTemplates: QuizTemplate[] | null = null;

export async function loadQuizTemplates(): Promise<QuizTemplate[]> {
  if (cachedTemplates) return cachedTemplates;

  const file = await readFile(QUIZ_TEMPLATE_PATH, "utf-8");
  const parsed: unknown = JSON.parse(file);
  if (!Array.isArray(parsed)) throw new Error("quiz_templates.json must contain an array.");

  cachedTemplates = parsed.map(normalizeQuizTemplate);
  return cachedTemplates;
}

export async function findQuizTemplateForObject(
  learningObjectId: string,
  activityType: ActivityType
): Promise<QuizTemplate | null> {
  const templates = await loadQuizTemplates();
  const exact = templates.find(
    (template) =>
      template.learning_object_id === learningObjectId &&
      template.activity_type === normalizeActivityType(activityType)
  );

  if (exact) return exact;

  return templates.find((template) => template.learning_object_id === learningObjectId) ?? null;
}

export async function findQuizTemplatesForObject(learningObjectId: string): Promise<QuizTemplate[]> {
  const templates = await loadQuizTemplates();
  return templates.filter((template) => template.learning_object_id === learningObjectId);
}

function normalizeQuizTemplate(value: unknown): QuizTemplate {
  if (!isRecord(value)) throw new Error("Invalid quiz template row.");

  return {
    template_id: readString(value, "template_id"),
    learning_object_id: readString(value, "learning_object_id"),
    activity_type: normalizeActivityType(readString(value, "activity_type")),
    prompt: readString(value, "prompt"),
    instruction_ko: readString(value, "instruction_ko"),
    choices: Array.isArray(value.choices)
      ? value.choices.filter((choice): choice is string => typeof choice === "string")
      : [],
    answer_ref: readString(value, "answer_ref"),
    difficulty: readDifficulty(value.difficulty),
    status: readStatus(value.status),
    source: readString(value, "source"),
  };
}

function normalizeActivityType(activityType: ActivityType | string): QuizTemplate["activity_type"] {
  if (activityType === "review" || activityType === "new_learning") return "retrieval";
  if (activityType === "contrast") return "context_choice";
  if (activityType === "conversation") return "conversation_turn";
  if (activityType === "application") return "sentence_production";

  if (
    activityType === "recognition" ||
    activityType === "retrieval" ||
    activityType === "fill_blank" ||
    activityType === "context_choice" ||
    activityType === "sentence_production" ||
    activityType === "application" ||
    activityType === "conversation" ||
    activityType === "conversation_turn" ||
    activityType === "contrast"
  ) {
    return activityType;
  }

  return "retrieval";
}

function readDifficulty(value: unknown): QuizTemplate["difficulty"] {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5 ? value : 3;
}

function readStatus(value: unknown): QuizTemplate["status"] {
  return value === "verified" || value === "released" ? value : "draft";
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
