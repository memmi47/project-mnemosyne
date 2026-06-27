---
title: Decision Log
document_id: 090_Decision_Log
version: 0.1
status: Draft
language: ko-KR
owner: Jungdo Lee
project: Project Mnemosyne
last_updated: 2026-06-27
---

# Decision Log

## 목적

Decision Log는 Project Mnemosyne의 주요 제품, 데이터, 엔지니어링 의사결정을 기록하는 문서이다. 시간이 지나도 “왜 그렇게 결정했는가”를 추적할 수 있도록 결정 배경, 선택지, 최종 결정, 영향 범위를 명확히 남긴다.

## DL-001. 모든 공식 문서는 한국어 Markdown으로 작성한다

- 날짜: 2026-06-27
- 상태: Accepted
- 배경: 프로젝트는 정도님 개인 사용을 목표로 하며, 설계 의도와 검토 효율을 위해 한국어가 가장 적합하다. Codex, Claude Code, Cursor도 한국어 Markdown을 충분히 이해할 수 있다.
- 결정: 모든 공식 문서는 한국어 Markdown으로 작성한다.
- 영향: README, Product Constitution, PRD, Dataset Spec, Engine Spec, Prompt Library 모두 한국어를 기본 언어로 한다.

## DL-002. 제품은 상용화가 아니라 단일 사용자 최적화를 목표로 한다

- 날짜: 2026-06-27
- 상태: Accepted
- 배경: 사용자는 본 앱을 상업화할 계획이 없으며, 본인의 영어 학습 효율과 지속성을 극대화하는 것이 목적이라고 명시했다.
- 결정: 제품 설계의 기본 최적화 대상은 불특정 다수가 아니라 정도님 한 명이다.
- 영향: 범용 온보딩, 결제, 다중 사용자 관리, 대중적 게임화는 우선순위에서 제외한다. 개인화 정확도와 학습 효율을 우선한다.

## DL-003. AI는 외부 개인 정보가 아니라 학습 프로그램 내부 데이터만으로 개입한다

- 날짜: 2026-06-27
- 상태: Accepted
- 배경: AI가 사용자의 피로도, 일정, 업무 상황 등 모든 정보를 알 수 없으므로 적극적 개입의 근거를 외부 개인 정보에 둘 수 없다.
- 결정: AI의 개입은 앱 내부 학습 데이터, 즉 정답률, 오답 유형, 응답 시간, 복습 지연, Speaking Skip, 혼동 패턴 등에 기반한다.
- 영향: Learner Model과 Adaptive Engine은 학습 이벤트 로그를 중심으로 설계한다.

## DL-004. Knowledge Graph는 확장형 구조로 설계한다

- 날짜: 2026-06-27
- 상태: Accepted
- 배경: 단순 phrasal verb 목록보다 의미, 문법, 유사 표현, 혼동 표현, 빈도, CEFR, 예문, 상황 맥락이 연결된 구조가 장기 경쟁력과 학습 효과에 유리하다.
- 결정: Dataset v2는 Learning Object와 Knowledge Graph 중심으로 설계한다.
- 영향: OCR 데이터는 Unit 중심 Markdown이 아니라 Learning Object 단위 Static Dataset으로 재구성한다.

## DL-005. 최상위 문장은 “We do not build English courses. We build AI systems that optimize human learning.”로 한다

- 날짜: 2026-06-27
- 상태: Accepted
- 배경: 프로젝트의 본질은 영어 코스 제작이 아니라 인간 학습 최적화 시스템 구축이다.
- 결정: 해당 문장을 Product Constitution의 최상위 문장으로 사용한다.
- 영향: PRD, README, Vision 문서에서 동일 철학을 유지한다.
