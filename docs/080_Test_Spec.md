---
title: Test Specification
document_id: 080_Test_Spec
version: 1.0
status: Draft
language: ko-KR
project: Project Mnemosyne
last_updated: 2026-06-27
---

# Test Specification

## 필수 단위 테스트

| Test ID | 대상 | 기대 결과 |
|---|---|---|
| T-001 | updateMemoryObject 정답 | memory_strength 증가 |
| T-002 | updateMemoryObject 오답 | memory_strength 감소 |
| T-003 | calculateForgettingRisk | 오래된 복습일수록 risk 증가 |
| T-004 | scheduleNextReview | memory_strength에 따라 interval 변경 |
| T-005 | generateDailyRecommendations | risk 높은 항목 우선 |
| T-006 | confusion_error | contrast activity 추천 |
| T-007 | Event append | 이벤트 누락 없이 저장 |

## 통합 테스트

1. 앱 시작
2. Learning Object 로드
3. Memory Object 생성
4. Today Mission 생성
5. 답안 제출
6. Event 저장
7. Memory 업데이트
8. Review Queue 업데이트
