---
title: MVP Execution Plan
document_id: 101_MVP_Execution_Plan
version: 0.1
status: Draft
language: ko-KR
project: Project Mnemosyne
last_updated: 2026-06-27
---

# MVP Execution Plan

## 1. 목적

이 문서는 Project Mnemosyne MVP 구현을 시작하기 위한 실행 계획이다. 기준 파일은 다음 네 개다.

- `sqlite/create_tables.sql`
- `src/domain/models.ts`
- `src/core/memory/learningEngine.ts`
- `dataset/static/learning_objects.json`

MVP의 목표는 Unit 순서 기반 학습 앱이 아니라, Today Mission 중심의 로컬 실행 가능한 Web-first / SQLite 기반 기억 관리 루프를 만드는 것이다.

## 2. 현재 저장소 상태

현재 저장소는 문서, 스키마, 정적 데이터셋, 엔진 초안 중심으로 구성되어 있다.

```text
docs/          제품/엔진/API/UI/테스트 명세
schemas/       JSON Schema
sqlite/        SQLite 테이블 생성 SQL
dataset/       Static Dataset, Graph, Templates, Metadata
prompts/       AI Tutor Prompt Library
scripts/       OCR 변환 스크립트
src/
  domain/      TypeScript Domain Model
  core/        Learning Engine 초안
  repositories/Repository interface
tests/         현재 비어 있음
```

아직 Next.js 앱, `package.json`, 로컬 DB 초기화 코드, API Route, UI 화면, 테스트 러너 설정은 없다.

## 3. 기준 파일 점검

### 3.1 `sqlite/create_tables.sql`

이미 MVP 핵심 테이블이 있다.

- `learning_objects`
- `memory_objects`
- `learning_events`
- `review_queue`

이 스키마는 Static Dataset과 Dynamic Dataset을 분리한다. `learning_events`는 append-only Event Log로 사용하고, `memory_objects`와 `review_queue`는 현재 상태 캐시로 사용한다.

보완 필요 사항:

- `learning_events.event_type`의 허용 값은 TypeScript union과 맞춘다.
- `review_queue`는 `Recommendation` 모델의 `recommendation_id`, `source_signals`와 매핑 규칙이 필요하다.
- `learning_objects`에는 `examples_json` 컬럼이 없어 현재 `LearningObject.examples`를 저장할 수 없다. MVP에서는 Static JSON을 source of truth로 두고 SQLite에는 최소 조회 필드만 seed하거나, 컬럼을 추가하는 결정을 먼저 해야 한다.

### 3.2 `src/domain/models.ts`

Learning Object, Memory Object, Event, Recommendation, Quiz Template 타입이 정의되어 있다. MVP의 타입 기준으로 사용한다.

보완 필요 사항:

- `LearningEvent.event_type`이 `string`이라 이벤트 누락/오타를 막기 어렵다. MVP 필수 이벤트 union으로 좁힌다.
- `SourceReference`에는 실제 데이터의 `raw_candidate` 필드가 없다. Static Loader에서 보존할지 제거할지 결정한다.
- `Recommendation`은 DB의 `review_queue`와 필드명이 다르므로 변환 레이어가 필요하다.

### 3.3 `src/core/memory/learningEngine.ts`

Memory Strength, Mastery Score, Forgetting Risk, Review Interval, Daily Recommendation의 첫 구현이 있다.

보완 필요 사항:

- 현재 import 경로는 `src/core/memory` 기준으로 `../../domain/models`가 되어야 한다.
- `updateMemoryObject`가 모든 이벤트에서 `last_reviewed_at`을 갱신한다. MVP에서는 `answer_evaluated`, `item_skipped`처럼 학습 상태를 바꾸는 이벤트만 갱신한다.
- `scheduleNextReview`가 `updateMemoryObject`에 연결되어 있지 않아 `next_review_at`이 업데이트되지 않는다.
- `calculateForgettingRisk`가 `next_review_at` overdue와 confusion signal을 아직 반영하지 않는다.
- `generateDailyRecommendations`가 review/new learning 비율과 due date를 충분히 반영하지 않는다.

### 3.4 `dataset/static/learning_objects.json`

현재 1,909개 Learning Object가 존재하며 모두 `review_required` 상태다. `dataset/metadata/learning_object_generation_report.json`에 따르면 OCR-derived draft 데이터다.

MVP 구현 원칙:

- Unit 번호는 출처와 검수용 Provenance로만 사용한다.
- 앱의 기본 선택 기준은 `learning_object_id`와 Memory Object 상태다.
- `definition_ko`, `definition_en`, `examples`가 비어 있는 객체는 meaning recognition이나 application 문제에서 제외하거나 fallback 문제만 생성한다.
- OCR 노이즈 가능성이 있는 객체를 그대로 학습에 밀어 넣지 않도록 Static Loader에 validation 결과를 포함한다.

## 4. 목표 저장소 구조

현재 구조를 크게 뒤집지 않고, Next.js App Router와 엔진/데이터 계층을 추가한다.

```text
app/
  page.tsx
  session/page.tsx
  progress/page.tsx
  learning-objects/[id]/page.tsx
  api/
    learning-objects/route.ts
    learning-objects/[id]/route.ts
    today-mission/route.ts
    session/start/route.ts
    answer/submit/route.ts
    hint/route.ts
    session/complete/route.ts
    progress/route.ts
components/
  today-mission-card.tsx
  quiz-card.tsx
  tutor-hint-panel.tsx
  memory-dashboard.tsx
  learning-object-detail.tsx
src/
  core/
    memory/
    adaptive/
    scheduler/
    scoring/
  data/
    static-loader/
    sqlite/
    event-store/
    learner-state/
  domain/
  repositories/
  services/
tests/
  core/
  data/
  integration/
```

`src/core`는 UI와 독립적인 순수 TypeScript 함수 중심으로 유지한다. `app/api`는 실제 네트워크 API라기보다 로컬 service contract의 얇은 wrapper로 둔다.

## 5. 실행 계획

### 5.1 Phase 0. 프로젝트 부트스트랩

1. Next.js App Router, TypeScript strict, Tailwind CSS, lint/test 설정을 추가한다.
   - 검증: `npm run lint`, `npm run test`가 실행 가능한 상태
2. App Router 기본 화면을 Today Mission 홈으로 둔다.
   - 검증: `npm run dev`에서 `/`가 Unit 목록이 아닌 Today Mission을 표시
3. 불필요한 신규 기능은 추가하지 않는다.
   - 검증: 로그인, 결제, 커뮤니티, 게임화 라우트가 없음

### 5.2 Phase 1. 데이터 계약 정렬

1. `src/domain/models.ts`를 SQLite, JSON Schema, 실제 Dataset shape와 맞춘다.
   - 검증: `learning_objects.json`을 타입 검증하며 로드
2. Static Dataset Loader를 구현한다.
   - 검증: 1,909개 Learning Object 조회 가능
3. Dataset validation을 추가한다.
   - 검증: `review_required`, 빈 정의, 빈 예문, OCR 후보 필드가 리포트로 분리됨
4. SQLite 초기화와 seed 경로를 구현한다.
   - 검증: `learning_objects`, `memory_objects`, `learning_events`, `review_queue` 생성 확인

### 5.3 Phase 2. Memory Object와 Event Log

1. 단일 사용자 `user_jungdo` 기준 Memory Object 생성 로직을 구현한다.
   - 검증: Learning Object별 Memory Object가 없으면 기본값으로 생성
2. Event Store를 append-only로 구현한다.
   - 검증: `session_started`, `item_shown`, `answer_submitted`, `answer_evaluated`, `hint_requested`, `retry_attempted`, `item_skipped`, `review_scheduled`, `mastery_updated`, `session_completed` 저장
3. Event 저장 후 Memory Object를 업데이트한다.
   - 검증: 정답/오답/힌트/스킵 이벤트가 Memory Strength와 count를 변경

### 5.4 Phase 3. Learning Engine 완성

1. `updateMemoryObject`를 명세 계산식에 맞게 보완한다.
   - 검증: T-001, T-002 통과
2. `calculateForgettingRisk`에 time decay, low memory, recent error, overdue, confusion을 반영한다.
   - 검증: T-003 통과
3. `scheduleNextReview`를 Memory 업데이트에 연결한다.
   - 검증: T-004 통과
4. `generateDailyRecommendations`를 Review First 규칙으로 보완한다.
   - 검증: T-005, T-006 통과

### 5.5 Phase 4. Today Mission과 Review Queue

1. Review Queue 생성/저장 서비스를 구현한다.
   - 검증: due item이 priority 순서로 pending queue에 저장됨
2. Today Mission service를 구현한다.
   - 검증: 복습/비교/신규 학습 수와 추천 이유 반환
3. 신규 학습은 복습 대기열이 안정적일 때만 제한적으로 포함한다.
   - 검증: overdue review가 많으면 new learning이 0개

### 5.6 Phase 5. Quiz Session

1. Quiz Template과 Answer Graph를 읽어 문제를 구성한다.
   - 검증: retrieval, application, contrast 중 최소 3개 activity type 제공
2. 답안 제출 API를 구현한다.
   - 검증: 답안 평가, Event 저장, Memory 업데이트, next review 예약이 한 요청에서 수행됨
3. 정답 즉시 공개를 제한한다.
   - 검증: 첫 실패 응답은 힌트/재시도 중심이며, 정답 공개는 명시 요청 또는 반복 실패 후에만 허용

### 5.7 Phase 6. Minimal UI

1. Home은 `TodayMissionCard` 중심으로 구현한다.
   - 검증: 첫 화면에서 오늘 추천 이유와 시작 버튼이 보임
2. Session은 `QuizCard`와 `TutorHintPanel`만 우선 구현한다.
   - 검증: recognition/retrieval/application/contrast 입력 흐름이 동작
3. Progress는 정답률보다 Memory 상태를 보여준다.
   - 검증: Memory Strength 분포, 약한 표현, 다음 복습 예정 표시

### 5.8 Phase 7. AI Tutor Mock

1. 실제 AI 호출 전 Prompt Library 기반 mock tutor를 구현한다.
   - 검증: 힌트 요청 시 정답 대신 회상 유도 힌트 반환
2. 오답 유형별 짧은 피드백을 제공한다.
   - 검증: `confusion_error`, `grammar_pattern_error`, `production_error`별 피드백 분기
3. AI Tutor 행동도 Event Log에 남긴다.
   - 검증: `hint_requested`, `ai_feedback_shown` 저장

## 6. 테스트 계획

최소 테스트는 `docs/080_Test_Spec.md`의 7개 단위 테스트를 우선 구현한다.

| Test ID | 구현 대상 | 검증 기준 |
|---|---|---|
| T-001 | `updateMemoryObject` 정답 | `memory_strength` 증가 |
| T-002 | `updateMemoryObject` 오답 | `memory_strength` 감소 |
| T-003 | `calculateForgettingRisk` | 오래된 복습일수록 risk 증가 |
| T-004 | `scheduleNextReview` | strength 구간별 interval 변경 |
| T-005 | `generateDailyRecommendations` | risk 높은 항목 우선 |
| T-006 | confusion error | contrast activity 추천 |
| T-007 | Event Store | 이벤트 누락 없이 append |

통합 테스트는 다음 루프 하나를 통과하면 MVP 골격 완료로 본다.

```text
앱 시작
→ Learning Object 로드
→ Memory Object 생성
→ Today Mission 생성
→ 답안 제출
→ Event 저장
→ Memory 업데이트
→ Review Queue 업데이트
```

## 7. 우선 해결 이슈

1. `src/core/memory/learningEngine.ts` import 경로를 수정해야 한다.
2. `learning_objects.json`의 모든 객체가 `review_required`이므로, 학습 대상 필터링/validation이 필요하다.
3. 현재 데이터에는 빈 정의와 빈 예문이 많아 meaning recognition 문제는 바로 안정적으로 만들 수 없다.
4. `LearningObject.examples`와 SQLite `learning_objects` 테이블 간 저장 전략을 결정해야 한다.
5. `LearningEvent.event_type`을 union으로 좁혀 Event Log 품질을 보장해야 한다.

## 8. 구현 순서 원칙

- UI보다 엔진과 데이터 구조를 먼저 구현한다.
- 정답률보다 Memory Strength, Mastery Score, Review Queue를 먼저 노출한다.
- 모든 학습 행동은 Event Log를 거쳐 Memory Object를 갱신한다.
- Learning Object와 Memory Object는 절대 합치지 않는다.
- Unit은 출처 필드로만 사용하고 추천 기준으로 사용하지 않는다.
- MVP 범위 밖 기능은 라우트와 테이블을 만들지 않는다.
