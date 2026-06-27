---
title: API Specification
document_id: 070_API_Spec
version: 1.0
status: Draft
language: ko-KR
project: Project Mnemosyne
last_updated: 2026-06-27
---

# API Specification

## 목적

이 문서는 Codex가 MVP API 또는 서버 액션을 구현할 수 있도록 최소 API Contract를 정의한다. 초기 MVP는 단일 사용자 Local-first 구조이므로 REST API는 실제 네트워크 API가 아니라 내부 service contract로 구현해도 된다.

## Endpoints

| Method | Path | 목적 |
|---|---|---|
| GET | `/api/learning-objects` | 전체 Learning Object 조회 |
| GET | `/api/learning-objects/:id` | 단일 Learning Object 조회 |
| GET | `/api/today-mission` | Daily Recommendation 조회 |
| POST | `/api/session/start` | 학습 세션 시작 |
| POST | `/api/answer/submit` | 답안 제출 및 평가 |
| POST | `/api/hint` | AI Tutor 힌트 요청 |
| POST | `/api/session/complete` | 세션 종료 및 요약 |
| GET | `/api/progress` | Memory 상태 요약 |

## POST /api/answer/submit

### Request

```json
{
  "session_id": "session_000001",
  "learning_object_id": "lo_000001",
  "activity_type": "retrieval",
  "answer": "look up",
  "response_latency_ms": 4200,
  "hint_used": false,
  "attempt_count": 1
}
```

### Response

```json
{
  "is_correct": true,
  "correct_answer": "look up",
  "feedback_ko": "정답입니다. 직접 회상에 성공했으므로 기억 강도가 상승합니다.",
  "updated_memory": {
    "memory_strength": 65,
    "mastery_score": 58,
    "next_review_at": "2026-06-30T00:00:00+09:00"
  }
}
```

## GET /api/today-mission

### Response

```json
{
  "user_id": "user_jungdo",
  "mission_summary": "오늘은 복습 7개와 비교 학습 2개를 추천합니다.",
  "recommendations": []
}
```
