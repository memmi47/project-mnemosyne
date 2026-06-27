---
title: Codex Handoff
document_id: 099_Codex_Handoff
version: 2.0
status: Ready
language: ko-KR
project: Project Mnemosyne
last_updated: 2026-06-27
---

# Codex Handoff v2.0

## Codex 작업 목표

이 저장소를 기반으로 Project Mnemosyne MVP를 구현한다. Codex는 문서를 먼저 읽고, 스키마와 TypeScript Domain Model을 기준으로 구현해야 한다.

## 반드시 먼저 읽을 문서

1. `docs/000_Founding_Philosophy.md`
2. `docs/001_Product_Constitution.md`
3. `docs/020_PRD.md`
4. `docs/030_Learning_Engine_Spec.md`
5. `docs/040_Dataset_v2_Spec.md`
6. `docs/070_API_Spec.md`
7. `docs/071_UI_Component_Spec.md`
8. `docs/080_Test_Spec.md`

## 구현 우선순위

1. Next.js 또는 React 기반 MVP 앱 초기화
2. SQLite DB 초기화
3. Static Dataset Loader 구현
4. Memory Object 생성
5. Today Mission 생성
6. Quiz Session 구현
7. Event Logging 구현
8. Memory Engine 연결
9. Progress Dashboard 구현
10. AI Tutor mock 연결

## 구현 금지

- Unit 순서 기반 강제 학습
- 정답률 중심 Dashboard
- 과도한 게임화
- AI가 정답을 즉시 공개하는 UX
- 데이터 스키마 무시한 임의 객체 생성

## 완료 기준

- 로컬에서 앱 실행 가능
- Learning Object 조회 가능
- Today Mission 생성 가능
- 답안 제출 시 Event 저장
- Memory Strength 업데이트
- 다음 Review Queue 생성
- 최소 테스트 7개 통과
