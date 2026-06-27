// Project Mnemosyne Domain Model v2.0

export type LearningStage =
  | "exposure"
  | "recognition"
  | "retrieval"
  | "application"
  | "conversation"
  | "automaticity";

export type ActivityType =
  | "review"
  | "recognition"
  | "retrieval"
  | "fill_blank"
  | "context_choice"
  | "sentence_production"
  | "application"
  | "conversation"
  | "conversation_turn"
  | "contrast"
  | "new_learning"
  | "hold";

export type ObjectStatus = "raw" | "normalized" | "review_required" | "verified" | "released";

export type LearningEventType =
  | "session_started"
  | "session_completed"
  | "item_shown"
  | "answer_submitted"
  | "answer_evaluated"
  | "hint_requested"
  | "retry_attempted"
  | "item_skipped"
  | "ai_feedback_shown"
  | "review_scheduled"
  | "mastery_updated";

export interface SourceReference {
  source_reference_id?: string;
  unit?: number | null;
  page?: number | null;
  source_pages?: number[];
  exercise?: string | null;
  source_file?: string;
  raw_text?: string;
  raw_candidate?: Record<string, unknown>;
  status?: string;
}

export interface Example {
  text: string;
  type: "general" | "business" | "ocr_context" | "ai_generated";
  status?: "draft" | "verified" | "released" | "review_required";
}

export interface ContentV3Example {
  text: string;
  type: string;
  source: string;
  status: "draft" | "verified" | "released" | "review_required" | string;
}

export interface ContentV3Examples {
  book_examples: ContentV3Example[];
  generated_examples: ContentV3Example[];
  minimum_example_count?: number;
  quality_note?: string;
}

export interface ContentV3Exercise {
  exercise_id: string;
  activity_type: ActivityType;
  instruction_ko: string;
  question: string;
  choices: string[];
  answer_ref: string;
  stage: LearningStage | "fill_blank" | "context_choice" | "sentence_production" | "conversation_turn";
  status: "draft" | "verified" | "released" | "review_required" | string;
}

export interface CommonMistake {
  wrong: string;
  correction: string;
  error_type: Exclude<ErrorType, null> | string;
  status: "draft" | "verified" | "released" | "review_required" | string;
}

export interface ContentHint {
  level: number;
  text_ko: string;
  status: "draft" | "verified" | "released" | "review_required" | string;
}

export interface ContentCompleteness {
  minimum_3_examples?: boolean;
  minimum_6_exercises?: boolean;
  has_common_mistakes?: boolean;
  has_hints?: boolean;
  book_content_status?: string;
}

export interface LearningObject {
  learning_object_id: string;
  expression: string;
  sense_id: string;
  base_verb: string;
  particles: string[];
  definition_en: string;
  definition_ko: string;
  grammar_pattern: string;
  separability: "separable" | "inseparable" | "not_applicable" | "unknown";
  transitivity: "transitive" | "intransitive" | "both" | "unknown";
  examples: Example[];
  semantic_tags: string[];
  context_tags: string[];
  confusing_objects: string[];
  source_references: SourceReference[];
  status: ObjectStatus;
  content_version?: string;
  examples_v3?: ContentV3Examples;
  exercises_v3?: ContentV3Exercise[];
  common_mistakes?: CommonMistake[];
  hints?: ContentHint[];
  learning_path?: ActivityType[];
  content_completeness?: ContentCompleteness;
}

export interface MemoryObject {
  memory_object_id: string;
  user_id: string;
  learning_object_id: string;
  mastery_score: number;
  memory_strength: number;
  forgetting_risk: number;
  learning_stage: LearningStage;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  correct_count: number;
  incorrect_count: number;
  avg_response_latency_ms: number | null;
  confusion_targets: string[];
  updated_at?: string;
}

export type ErrorType =
  | "meaning_error"
  | "grammar_pattern_error"
  | "confusion_error"
  | "context_error"
  | "production_error"
  | "spelling_error"
  | "overgeneralization"
  | null;

export interface LearningEvent {
  event_id: string;
  event_type: LearningEventType;
  timestamp: string;
  user_id: string;
  session_id: string;
  learning_object_id?: string | null;
  activity_type?: ActivityType | null;
  is_correct?: boolean | null;
  response_latency_ms?: number | null;
  hint_used: boolean;
  attempt_count: number;
  error_type?: ErrorType;
  metadata: Record<string, unknown>;
}

export interface Recommendation {
  recommendation_id: string;
  learning_object_id: string;
  activity_type: ActivityType;
  priority_score: number;
  reason: string;
  source_signals: string[];
  created_at?: string;
}

export interface TodayMission {
  user_id: string;
  mission_summary: string;
  primary_reason: string;
  review_count: number;
  contrast_count: number;
  new_learning_count: number;
  recommendations: Recommendation[];
}

export interface QuizTemplate {
  template_id: string;
  learning_object_id: string;
  activity_type: Exclude<ActivityType, "review" | "hold" | "new_learning">;
  prompt: string;
  instruction_ko?: string;
  choices: string[];
  answer_ref: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: "draft" | "verified" | "released";
  source?: string;
}

export interface AnswerGraphEntry {
  answer_ref: string;
  learning_object_id: string;
  answer: string;
  accepted_answers: string[];
  status: "draft" | "verified" | "released" | "review_required" | string;
}
