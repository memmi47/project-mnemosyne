-- Project Mnemosyne SQLite Schema v0.1

CREATE TABLE IF NOT EXISTS learning_objects (
  learning_object_id TEXT PRIMARY KEY,
  expression TEXT NOT NULL,
  sense_id TEXT NOT NULL,
  base_verb TEXT,
  particles_json TEXT,
  definition_en TEXT,
  definition_ko TEXT NOT NULL,
  grammar_pattern TEXT,
  separability TEXT,
  transitivity TEXT,
  semantic_tags_json TEXT,
  context_tags_json TEXT,
  source_references_json TEXT,
  status TEXT NOT NULL DEFAULT 'review_required'
);

CREATE TABLE IF NOT EXISTS memory_objects (
  memory_object_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  learning_object_id TEXT NOT NULL,
  mastery_score REAL NOT NULL DEFAULT 0,
  memory_strength REAL NOT NULL DEFAULT 0,
  forgetting_risk REAL NOT NULL DEFAULT 0,
  learning_stage TEXT NOT NULL DEFAULT 'exposure',
  last_reviewed_at TEXT,
  next_review_at TEXT,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  avg_response_latency_ms REAL,
  confusion_targets_json TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (learning_object_id) REFERENCES learning_objects(learning_object_id)
);

CREATE TABLE IF NOT EXISTS learning_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  learning_object_id TEXT,
  activity_type TEXT,
  is_correct INTEGER,
  response_latency_ms REAL,
  hint_used INTEGER NOT NULL DEFAULT 0,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  error_type TEXT,
  metadata_json TEXT
);

CREATE TABLE IF NOT EXISTS review_queue (
  queue_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  learning_object_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  priority_score REAL NOT NULL,
  reason TEXT,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_memory_next_review ON memory_objects(next_review_at);
CREATE INDEX IF NOT EXISTS idx_events_learning_object ON learning_events(learning_object_id);
CREATE INDEX IF NOT EXISTS idx_review_queue_user_status ON review_queue(user_id, status);
