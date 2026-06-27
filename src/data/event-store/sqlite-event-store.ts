import type { LearningEvent } from "../../domain/models";
import { getDatabase } from "../sqlite/database";

interface LearningEventRow {
  event_id: string;
  event_type: string;
  timestamp: string;
  user_id: string;
  session_id: string;
  learning_object_id: string | null;
  activity_type: string | null;
  is_correct: number | null;
  response_latency_ms: number | null;
  hint_used: number;
  attempt_count: number;
  error_type: string | null;
  metadata_json: string | null;
}

export async function appendLearningEvent(event: LearningEvent): Promise<void> {
  const db = getDatabase();

  db.prepare(`
    INSERT INTO learning_events (
      event_id,
      event_type,
      timestamp,
      user_id,
      session_id,
      learning_object_id,
      activity_type,
      is_correct,
      response_latency_ms,
      hint_used,
      attempt_count,
      error_type,
      metadata_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    event.event_id,
    event.event_type,
    event.timestamp,
    event.user_id,
    event.session_id,
    event.learning_object_id ?? null,
    event.activity_type ?? null,
    event.is_correct == null ? null : Number(event.is_correct),
    event.response_latency_ms ?? null,
    Number(event.hint_used),
    event.attempt_count,
    event.error_type ?? null,
    JSON.stringify(event.metadata)
  );
}

export async function findLearningEventsBySession(
  userId: string,
  sessionId: string
): Promise<LearningEvent[]> {
  const rows = getDatabase()
    .prepare(`
      SELECT *
      FROM learning_events
      WHERE user_id = ? AND session_id = ?
      ORDER BY timestamp ASC
    `)
    .all(userId, sessionId) as LearningEventRow[];

  return rows.map(mapLearningEvent);
}

function mapLearningEvent(row: LearningEventRow): LearningEvent {
  return {
    event_id: row.event_id,
    event_type: readEventType(row.event_type),
    timestamp: row.timestamp,
    user_id: row.user_id,
    session_id: row.session_id,
    learning_object_id: row.learning_object_id,
    activity_type: readActivityType(row.activity_type),
    is_correct: row.is_correct == null ? null : Boolean(row.is_correct),
    response_latency_ms: row.response_latency_ms,
    hint_used: Boolean(row.hint_used),
    attempt_count: row.attempt_count,
    error_type: readErrorType(row.error_type),
    metadata: readMetadata(row.metadata_json),
  };
}

function readEventType(value: string): LearningEvent["event_type"] {
  if (
    value === "session_started" ||
    value === "session_completed" ||
    value === "item_shown" ||
    value === "answer_submitted" ||
    value === "answer_evaluated" ||
    value === "hint_requested" ||
    value === "retry_attempted" ||
    value === "item_skipped" ||
    value === "ai_feedback_shown" ||
    value === "review_scheduled" ||
    value === "mastery_updated"
  ) {
    return value;
  }

  return "item_shown";
}

function readActivityType(value: string | null): LearningEvent["activity_type"] {
  if (
    value === "review" ||
    value === "recognition" ||
    value === "retrieval" ||
    value === "fill_blank" ||
    value === "context_choice" ||
    value === "sentence_production" ||
    value === "application" ||
    value === "conversation" ||
    value === "conversation_turn" ||
    value === "contrast" ||
    value === "new_learning" ||
    value === "hold"
  ) {
    return value;
  }

  return null;
}

function readErrorType(value: string | null): LearningEvent["error_type"] {
  if (
    value === "meaning_error" ||
    value === "grammar_pattern_error" ||
    value === "confusion_error" ||
    value === "context_error" ||
    value === "production_error" ||
    value === "spelling_error" ||
    value === "overgeneralization"
  ) {
    return value;
  }

  return null;
}

function readMetadata(value: string | null): Record<string, unknown> {
  if (!value) return {};

  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
