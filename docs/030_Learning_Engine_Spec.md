---
title: Learning Engine Specification
document_id: 030_Learning_Engine_Spec
version: 0.1
status: Draft
language: ko-KR
owner: Jungdo Lee
project: Project Mnemosyne
last_updated: 2026-06-27
---

# Learning Engine Specification

## 1. 문서 목적

본 문서는 Project Mnemosyne의 Learning Engine 구현 명세이다. Learning Engine은 Memory Engine, Adaptive Engine, Review Scheduler, Scoring Module로 구성되며, 사용자의 학습 이벤트를 기반으로 Memory Object 상태를 업데이트하고 다음 학습 활동을 결정한다. 본 문서는 Codex와 Claude Code가 실제 구현을 시작할 수 있도록 알고리즘, 상태값, 이벤트 처리 규칙, MVP 구현 범위를 정의한다.

## 2. 엔진 구성

Learning Engine은 다음 네 개의 하위 모듈로 구성한다.

| 모듈 | 역할 |
|---|---|
| Memory Engine | Memory Strength, Mastery Score, Forgetting Risk 업데이트 |
| Adaptive Engine | 다음 학습 항목과 활동 유형 선택 |
| Review Scheduler | next_review_at과 Review Queue 생성 |
| Scoring Module | 답변 결과, 응답 시간, 힌트 사용 여부를 점수화 |

각 모듈은 독립 테스트가 가능해야 하며, UI와 직접 결합하지 않는다.

## 3. 핵심 데이터 객체

### 3.1 Learning Object

Learning Object는 정적 지식 단위이다. 표현, 의미, 문법, 예문, 혼동 표현, 출처 정보를 포함한다.

### 3.2 Memory Object

Memory Object는 특정 Learning Object에 대한 사용자별 동적 기억 상태이다. MVP에서는 단일 사용자만 존재하지만 구조상 user_id를 유지한다.

필수 필드는 다음과 같다.

| 필드 | 타입 | 설명 |
|---|---|---|
| memory_object_id | string | 고유 ID |
| user_id | string | 사용자 ID |
| learning_object_id | string | 연결된 Learning Object |
| mastery_score | number | 0~100 |
| memory_strength | number | 0~100 |
| forgetting_risk | number | 0~100 |
| learning_stage | string | exposure, recognition, retrieval, application, conversation, automaticity |
| last_reviewed_at | datetime | 마지막 복습 |
| next_review_at | datetime | 다음 복습 |
| correct_count | number | 누적 정답 |
| incorrect_count | number | 누적 오답 |
| avg_response_latency_ms | number | 평균 응답 시간 |
| recent_error_type | string | 최근 오답 유형 |
| confusion_targets | array | 혼동 표현 ID 목록 |

## 4. 이벤트 처리

모든 학습 활동은 Event Log에 저장된다. Memory Engine은 Event Log를 기반으로 Memory Object를 업데이트한다. 이벤트는 append-only로 보존하며, 상태값은 재계산 가능해야 한다.

필수 이벤트는 다음과 같다.

```json
{
  "event_id": "evt_000001",
  "event_type": "answer_evaluated",
  "timestamp": "2026-06-27T10:00:00+09:00",
  "user_id": "user_jungdo",
  "session_id": "session_000001",
  "learning_object_id": "lo_000001",
  "activity_type": "retrieval",
  "is_correct": true,
  "response_latency_ms": 4200,
  "hint_used": false,
  "attempt_count": 1,
  "error_type": null,
  "metadata": {}
}
```

## 5. Mastery Score 초기 계산식

MVP에서는 복잡한 모델 대신 규칙 기반 점수 계산식을 사용한다. Mastery Score는 학습 단계별 성과를 반영한다.

```text
mastery_score =
  recognition_score * 0.20
+ retrieval_score * 0.35
+ application_score * 0.25
+ conversation_score * 0.20
```

MVP에서 conversation_score가 없는 경우 해당 가중치는 application_score에 임시 배분한다. 단, 데이터 구조에는 conversation_score 필드를 유지한다.

## 6. Memory Strength 업데이트

Memory Strength는 각 학습 이벤트 후 업데이트한다. 기본 규칙은 다음과 같다.

| 이벤트 결과 | 변화 |
|---|---|
| 쉬운 Recognition 정답 | +2 |
| Retrieval 정답 | +5 |
| Application 정답 | +7 |
| Conversation 성공 | +10 |
| 오답 | -8 |
| 힌트 사용 후 정답 | +2 |
| 스킵 | -5 |
| 반복 혼동 오답 | -10 |

점수는 0~100 범위로 clamp한다.

## 7. Forgetting Risk 계산

MVP의 Forgetting Risk는 다음 요소를 사용한다.

```text
forgetting_risk =
  time_decay
+ low_memory_penalty
+ recent_error_penalty
+ overdue_penalty
+ confusion_penalty
```

초기 단순 계산식은 다음과 같다.

```text
time_decay = min(days_since_last_review * 5, 40)
low_memory_penalty = max(0, 60 - memory_strength) * 0.5
recent_error_penalty = 15 if last_result_incorrect else 0
overdue_penalty = 20 if now > next_review_at else 0
confusion_penalty = 10 if has_recent_confusion else 0
```

최종 값은 0~100 범위로 clamp한다.

## 8. Review Interval 규칙

초기 Review Interval은 학습 단계와 성과에 따라 설정한다.

| 상태 | 조건 | 다음 복습 |
|---|---|---|
| 신규 학습 | 첫 노출 | 1일 후 |
| 약한 기억 | memory_strength < 40 | 1일 후 |
| 불안정 | 40~60 | 3일 후 |
| 보통 | 60~75 | 7일 후 |
| 안정 | 75~90 | 14일 후 |
| 강함 | 90 이상 | 30일 후 |

오답이 발생하면 interval을 최소 1일 또는 기존 interval의 50%로 줄인다. 반복 혼동 오답은 다음 세션에서 비교 학습으로 예약한다.

## 9. Adaptive Recommendation

Adaptive Engine은 후보 Memory Object를 점수화하여 Daily Session을 구성한다. 추천 유형은 Review, Contrast, Retrieval, Application, Conversation, New Learning, Hold로 분류한다.

우선순위 계산식은 다음과 같다.

```text
priority_score =
  forgetting_risk * 0.35
+ (100 - memory_strength) * 0.25
+ error_severity * 0.15
+ confusion_score * 0.15
+ overdue_score * 0.10
```

추천 결과는 다음 구조를 가진다.

```json
{
  "recommendation_id": "rec_000001",
  "learning_object_id": "lo_000001",
  "activity_type": "contrast",
  "priority_score": 82,
  "reason": "최근 put off와 put away 혼동이 반복되어 비교 학습을 추천합니다.",
  "source_signals": ["recent_confusion", "low_memory_strength", "overdue_review"]
}
```

## 10. Daily Session 생성 규칙

Daily Session은 10~15분 기준으로 구성한다. MVP 기본 구성은 다음과 같다.

| 구성 요소 | 비중 |
|---|---|
| Overdue Review | 40% |
| Weak Object Practice | 30% |
| Contrast Practice | 20% |
| New Learning | 10% 이하 |

복습 대기열이 많은 날에는 New Learning을 0으로 설정할 수 있다. Today Mission은 추천 항목뿐 아니라 추천 이유를 함께 표시한다.

## 11. Learning Stage 전환

Learning Stage는 사용자의 성과에 따라 이동한다.

| 현재 단계 | 다음 단계 전환 조건 |
|---|---|
| exposure → recognition | 기본 의미 문제 2회 이상 성공 |
| recognition → retrieval | Recognition 정답률 80% 이상 |
| retrieval → application | 직접 회상 2회 이상 성공 |
| application → conversation | 문장 생성 성공 2회 이상 |
| conversation → automaticity | 대화 적용 성공 및 장기 복습 안정 |

오답이 반복되면 이전 단계로 되돌릴 수 있다.

## 12. 구현 우선순위

MVP 구현 우선순위는 다음과 같다.

1. Event Log 저장
2. Memory Object 생성
3. Mastery Score 업데이트
4. Review Interval 계산
5. Review Queue 생성
6. Daily Session 추천
7. 추천 이유 생성
8. Learning Stage 전환
9. Confusion Pair 추적

## 13. 테스트 케이스

Learning Engine은 다음 테스트를 통과해야 한다. 정답 이벤트가 들어오면 memory_strength가 증가해야 한다. 오답 이벤트가 들어오면 memory_strength가 감소하고 next_review_at이 앞당겨져야 한다. 반복 혼동 오답이 발생하면 activity_type이 contrast로 추천되어야 한다. 복습 예정일이 지난 항목은 Review Queue 상단에 위치해야 한다. Recognition 문제만 맞힌 항목은 Retrieval 단계로 무리하게 승격되어서는 안 된다.

## Related Documents

- [020_PRD.md](./020_PRD.md)
- [040_Dataset_v2_Spec.md](./040_Dataset_v2_Spec.md)
- [060_Data_Model.md](./060_Data_Model.md)
