"use client";

import type { MemoryObject } from "@/src/domain/models";

const STORAGE_KEY = "mnemosyne_memory_objects";
const TRACKED_IDS_KEY = "mnemosyne_tracked_ids";

export interface LocalMemoryRecord {
  learning_object_id: string;
  expression: string;
  mastery_score: number;
  memory_strength: number;
  forgetting_risk: number;
  correct_count: number;
  incorrect_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  updated_at: string;
}

function readRecords(): LocalMemoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeRecords(records: LocalMemoryRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/** 학습 결과를 localStorage에 저장 (정답/오답 반영) */
export function saveQuizResult(
  learningObjectId: string,
  expression: string,
  isCorrect: boolean
): void {
  const records = readRecords();
  const now = new Date().toISOString();
  const existing = records.find(r => r.learning_object_id === learningObjectId);

  if (existing) {
    if (isCorrect) {
      existing.correct_count += 1;
      existing.mastery_score = Math.min(100, existing.mastery_score + 15);
      existing.memory_strength = Math.min(100, existing.memory_strength + 20);
      existing.forgetting_risk = Math.max(0, existing.forgetting_risk - 15);
    } else {
      existing.incorrect_count += 1;
      existing.mastery_score = Math.max(0, existing.mastery_score - 5);
      existing.memory_strength = Math.max(0, existing.memory_strength - 10);
      existing.forgetting_risk = Math.min(100, existing.forgetting_risk + 20);
    }
    existing.last_reviewed_at = now;
    existing.updated_at = now;
    // 다음 복습 시점: 정답이면 더 나중에, 오답이면 빨리
    const hoursUntilReview = isCorrect ? existing.correct_count * 24 : 1;
    existing.next_review_at = new Date(Date.now() + hoursUntilReview * 3600000).toISOString();
  } else {
    records.push({
      learning_object_id: learningObjectId,
      expression,
      mastery_score: isCorrect ? 30 : 5,
      memory_strength: isCorrect ? 40 : 10,
      forgetting_risk: isCorrect ? 30 : 80,
      correct_count: isCorrect ? 1 : 0,
      incorrect_count: isCorrect ? 0 : 1,
      last_reviewed_at: now,
      next_review_at: new Date(Date.now() + (isCorrect ? 86400000 : 3600000)).toISOString(),
      updated_at: now,
    });
  }

  writeRecords(records);

  // 하위 호환: tracked_ids도 업데이트
  const tracked = JSON.parse(localStorage.getItem(TRACKED_IDS_KEY) || "[]");
  if (!tracked.includes(learningObjectId)) {
    tracked.push(learningObjectId);
    localStorage.setItem(TRACKED_IDS_KEY, JSON.stringify(tracked));
  }
}

/** 추적 중인 학습 기록 전체 조회 */
export function getTrackedRecords(): LocalMemoryRecord[] {
  return readRecords();
}

/** Progress 요약 데이터 생성 */
export function getLocalProgressSummary() {
  const records = readRecords();
  const tracked = records.length;
  const avgStrength = tracked === 0
    ? 0
    : Math.round(records.reduce((sum, r) => sum + r.memory_strength, 0) / tracked);
  const highRisk = records.filter(r => r.forgetting_risk >= 70).length;

  return {
    tracked_objects: tracked,
    average_memory_strength: avgStrength,
    high_forgetting_risk_objects: highRisk,
    records,
  };
}

/** 학습 데이터를 JSON으로 내보내기 */
export function exportLearningData(): string {
  const records = readRecords();
  const exportData = {
    version: "1.0",
    exported_at: new Date().toISOString(),
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    records,
  };
  return JSON.stringify(exportData, null, 2);
}

/** JSON 파일에서 학습 데이터 가져오기 */
export function importLearningData(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.records || !Array.isArray(data.records)) {
      return { success: false, count: 0, error: "유효하지 않은 데이터 형식입니다." };
    }

    const existingRecords = readRecords();
    const existingIds = new Set(existingRecords.map(r => r.learning_object_id));
    let importedCount = 0;

    for (const record of data.records) {
      if (!record.learning_object_id) continue;

      if (existingIds.has(record.learning_object_id)) {
        // 기존 기록이 있으면 더 최신 데이터로 덮어씌우기
        const idx = existingRecords.findIndex(r => r.learning_object_id === record.learning_object_id);
        if (idx >= 0 && record.updated_at > existingRecords[idx].updated_at) {
          existingRecords[idx] = record;
          importedCount++;
        }
      } else {
        existingRecords.push(record);
        importedCount++;
      }
    }

    writeRecords(existingRecords);

    // tracked_ids도 동기화
    const tracked = existingRecords.map(r => r.learning_object_id);
    localStorage.setItem(TRACKED_IDS_KEY, JSON.stringify(tracked));

    return { success: true, count: importedCount };
  } catch {
    return { success: false, count: 0, error: "JSON 파싱에 실패했습니다." };
  }
}

/** 전체 학습 데이터 초기화 */
export function clearLearningData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TRACKED_IDS_KEY);
}
