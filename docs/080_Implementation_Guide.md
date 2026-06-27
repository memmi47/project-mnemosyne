---
title: Implementation Guide
document_id: 080_Implementation_Guide
version: 0.2
status: Draft
language: ko-KR
project: Project Mnemosyne
last_updated: 2026-06-27
---

# Implementation Guide

## 목표

이 문서는 Codex, Claude Code, Cursor가 Project Mnemosyne의 MVP 구현을 시작할 수 있도록 작업 순서를 정의한다.

## 1단계. 저장소 초기화

다음 디렉터리 구조를 생성한다.

```text
project-mnemosyne/
  docs/
  dataset/
  schemas/
  prompts/
  sqlite/
  src/
  tests/
```

## 2단계. 데이터 로더 구현

`dataset/static/learning_objects.sample.json`을 읽어 Learning Object 목록을 반환하는 loader를 구현한다.

## 3단계. SQLite 초기화

`sqlite/create_tables.sql`을 실행하여 로컬 DB를 생성한다.

## 4단계. Memory Object 생성

앱 최초 실행 시 모든 Learning Object에 대해 기본 Memory Object를 생성한다.

기본값:

```json
{
  "mastery_score": 0,
  "memory_strength": 0,
  "forgetting_risk": 50,
  "learning_stage": "exposure"
}
```

## 5단계. Event Logging

모든 문제 응답, 힌트 요청, 스킵, 세션 완료를 `learning_events`에 저장한다.

## 6단계. Learning Engine 구현

`030_Learning_Engine_Spec.md`의 규칙에 따라 다음 함수를 구현한다.

```ts
updateMemoryObject(event, memoryObject)
calculateForgettingRisk(memoryObject, now)
scheduleNextReview(memoryObject)
generateDailyRecommendations(memoryObjects, learningObjects)
```

## 7단계. MVP UI

첫 화면은 Today Mission 하나만 구현한다.

필수 표시:

- 오늘 복습할 표현 수
- 가장 중요한 추천 이유
- 시작 버튼
- 세션 종료 후 기억 상태 요약

## 8단계. AI Tutor 연결

초기에는 실제 API 호출 없이 Prompt Library 기반 mock response로 시작한다. 이후 API를 연결한다.

## 9단계. 테스트

필수 테스트:

- 정답 시 Memory Strength 증가
- 오답 시 Memory Strength 감소
- 오답 시 Review Interval 단축
- 복습 기한 초과 항목이 Daily Mission에 포함
- 혼동 표현이 contrast activity로 추천
