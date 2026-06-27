---
title: UI and Component Specification
document_id: 071_UI_Component_Spec
version: 1.0
status: Draft
language: ko-KR
project: Project Mnemosyne
last_updated: 2026-06-27
---

# UI and Component Specification

## 화면 원칙

UI는 Today Mission 중심이다. 사용자는 Unit 목록을 탐색하는 것이 아니라 오늘 필요한 학습을 바로 시작해야 한다.

## MVP 화면

| 화면 | Component | 목적 |
|---|---|---|
| Home | TodayMissionCard | 오늘 학습 추천 |
| Session | QuizCard | 문제 풀이 |
| Session | TutorHintPanel | 힌트와 피드백 |
| Progress | MemoryDashboard | 기억 상태 요약 |
| Object Detail | LearningObjectDetail | 표현 상세 정보 |

## TodayMissionCard

필수 표시 항목은 다음과 같다.

- 오늘 추천 이유
- 복습 항목 수
- 비교 학습 항목 수
- 신규 학습 항목 수
- 시작 버튼

## QuizCard

QuizCard는 activity_type에 따라 렌더링을 바꾼다.

- recognition: 선택지 표시
- retrieval: 직접 입력
- application: 문장 생성 입력
- contrast: 두 표현 비교 후 선택
- conversation: AI Tutor 대화 입력

## Session 완료 화면

세션 완료 화면은 정답률보다 기억 상태 변화를 보여준다.

- 강화된 표현
- 여전히 약한 표현
- 다음 복습 예정
- 반복 혼동 표현
