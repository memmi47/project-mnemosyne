import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AnswerGraphEntry } from "../../domain/models";

const ANSWER_GRAPH_PATH = path.join(process.cwd(), "dataset", "metadata", "answer_graph_verified.json");

let cachedAnswers: AnswerGraphEntry[] | null = null;

export async function loadAnswerGraph(): Promise<AnswerGraphEntry[]> {
  if (cachedAnswers) return cachedAnswers;

  const file = await readFile(ANSWER_GRAPH_PATH, "utf-8");
  const parsed: unknown = JSON.parse(file);
  if (!Array.isArray(parsed)) throw new Error("answer_graph.content_v3.json must contain an array.");

  cachedAnswers = parsed.map(normalizeAnswerGraphEntry);
  return cachedAnswers;
}

export async function findAnswerGraphEntry(learningObjectId: string): Promise<AnswerGraphEntry | null> {
  const answers = await loadAnswerGraph();
  return answers.find((entry) => entry.learning_object_id === learningObjectId) ?? null;
}

function normalizeAnswerGraphEntry(value: unknown): AnswerGraphEntry {
  if (!isRecord(value)) throw new Error("Invalid answer graph row.");

  return {
    answer_ref: readString(value, "answer_ref"),
    learning_object_id: readString(value, "learning_object_id"),
    answer: readString(value, "answer"),
    accepted_answers: Array.isArray(value.accepted_answers)
      ? value.accepted_answers.filter((answer): answer is string => typeof answer === "string")
      : [],
    status: readString(value, "status") || "draft",
  };
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
