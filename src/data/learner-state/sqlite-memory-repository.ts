import type { LearningStage, MemoryObject } from "../../domain/models";
import { getDatabase } from "../sqlite/database";

interface MemoryObjectRow {
  memory_object_id: string;
  user_id: string;
  learning_object_id: string;
  mastery_score: number;
  memory_strength: number;
  forgetting_risk: number;
  learning_stage: string;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  correct_count: number;
  incorrect_count: number;
  avg_response_latency_ms: number | null;
  confusion_targets_json: string | null;
  updated_at: string;
}

export async function findMemoryObject(
  userId: string,
  learningObjectId: string
): Promise<MemoryObject | null> {
  const row = getDatabase()
    .prepare(`
      SELECT *
      FROM memory_objects
      WHERE user_id = ? AND learning_object_id = ?
      LIMIT 1
    `)
    .get(userId, learningObjectId) as MemoryObjectRow | undefined;

  return row ? mapMemoryObject(row) : null;
}

export async function findMemoryObjectsByUser(userId: string): Promise<MemoryObject[]> {
  const rows = getDatabase()
    .prepare(`
      SELECT *
      FROM memory_objects
      WHERE user_id = ?
      ORDER BY next_review_at ASC
    `)
    .all(userId) as MemoryObjectRow[];

  return rows.map(mapMemoryObject);
}

export async function saveMemoryObject(memoryObject: MemoryObject): Promise<void> {
  getDatabase()
    .prepare(`
      INSERT INTO memory_objects (
        memory_object_id,
        user_id,
        learning_object_id,
        mastery_score,
        memory_strength,
        forgetting_risk,
        learning_stage,
        last_reviewed_at,
        next_review_at,
        correct_count,
        incorrect_count,
        avg_response_latency_ms,
        confusion_targets_json,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(memory_object_id) DO UPDATE SET
        mastery_score = excluded.mastery_score,
        memory_strength = excluded.memory_strength,
        forgetting_risk = excluded.forgetting_risk,
        learning_stage = excluded.learning_stage,
        last_reviewed_at = excluded.last_reviewed_at,
        next_review_at = excluded.next_review_at,
        correct_count = excluded.correct_count,
        incorrect_count = excluded.incorrect_count,
        avg_response_latency_ms = excluded.avg_response_latency_ms,
        confusion_targets_json = excluded.confusion_targets_json,
        updated_at = excluded.updated_at
    `)
    .run(
      memoryObject.memory_object_id,
      memoryObject.user_id,
      memoryObject.learning_object_id,
      memoryObject.mastery_score,
      memoryObject.memory_strength,
      memoryObject.forgetting_risk,
      memoryObject.learning_stage,
      memoryObject.last_reviewed_at,
      memoryObject.next_review_at,
      memoryObject.correct_count,
      memoryObject.incorrect_count,
      memoryObject.avg_response_latency_ms,
      JSON.stringify(memoryObject.confusion_targets),
      memoryObject.updated_at ?? new Date().toISOString()
    );
}

function mapMemoryObject(row: MemoryObjectRow): MemoryObject {
  return {
    memory_object_id: row.memory_object_id,
    user_id: row.user_id,
    learning_object_id: row.learning_object_id,
    mastery_score: row.mastery_score,
    memory_strength: row.memory_strength,
    forgetting_risk: row.forgetting_risk,
    learning_stage: readLearningStage(row.learning_stage),
    last_reviewed_at: row.last_reviewed_at,
    next_review_at: row.next_review_at,
    correct_count: row.correct_count,
    incorrect_count: row.incorrect_count,
    avg_response_latency_ms: row.avg_response_latency_ms,
    confusion_targets: readStringArray(row.confusion_targets_json),
    updated_at: row.updated_at,
  };
}

function readLearningStage(value: string): LearningStage {
  if (
    value === "exposure" ||
    value === "recognition" ||
    value === "retrieval" ||
    value === "application" ||
    value === "conversation" ||
    value === "automaticity"
  ) {
    return value;
  }

  return "exposure";
}

function readStringArray(value: string | null): string[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}
