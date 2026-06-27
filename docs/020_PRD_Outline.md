---
title: PRD Outline
document_id: 020_PRD_Outline
version: 0.1
status: Draft
language: ko-KR
owner: Jungdo Lee
project: Project Mnemosyne
last_updated: 2026-06-27
---

# PRD Outline

## 1. 문서 목적

이 문서는 Project Mnemosyne의 100페이지급 Product Requirement Document를 작성하기 위한 목차 및 작성 기준이다. 본 문서는 최종 PRD가 아니라 PRD의 골격이며, Codex 및 Claude Code가 이후 세부 문서를 확장할 때 따라야 할 구조를 정의한다. PRD는 단순 기능 명세서가 아니라 제품 철학, 사용자 경험, 학습 엔진, 데이터 구조, AI Tutor, 구현 로드맵을 모두 포함하는 통합 제품 설계 문서가 되어야 한다.

## 2. PRD 작성 원칙

PRD는 한국어 Markdown으로 작성한다. 모든 장은 제품 의사결정과 구현으로 연결되어야 하며, 추상적 선언만 포함해서는 안 된다. 각 장은 “왜 필요한가”, “무엇을 만들어야 하는가”, “어떻게 동작해야 하는가”, “어떻게 검증할 것인가”를 포함해야 한다. 구현 세부사항이 필요한 영역은 별도 Specification 문서로 분리하되, PRD에서는 해당 문서로 연결한다.

## 3. 최종 PRD 예상 구조

| Chapter | 제목 | 예상 분량 | 목적 |
|---:|---|---:|---|
| 1 | Executive Summary | 3~5p | 제품의 핵심 정의와 의사결정 요약 |
| 2 | Product Context | 5~8p | 기존 학습 앱의 한계와 프로젝트 배경 |
| 3 | User Definition | 5~8p | 단일 사용자 최적화 관점의 사용자 정의 |
| 4 | Problem Statement | 8~10p | 기억 실패, 회상 실패, 실제 사용 실패 정의 |
| 5 | Product Vision | 8~10p | Personal Learning OS로서의 제품 비전 |
| 6 | Learning Philosophy | 10~12p | 학습 단계, Retrieval, Spacing, Conversation 원칙 |
| 7 | Product Scope | 6~8p | MVP 범위와 제외 범위 |
| 8 | Core User Journey | 10~12p | Daily Session, Review, Conversation Flow |
| 9 | Learning Object Architecture | 8~10p | Unit 해체 및 Learning Object 중심 구조 |
| 10 | Learner Model | 8~10p | Memory Strength, Mastery, Forgetting Risk |
| 11 | Adaptive Engine | 10~12p | 추천 로직, Review Queue, 우선순위 계산 |
| 12 | AI Tutor | 10~12p | AI 역할, 대화 원칙, 설명 가능성 |
| 13 | Dataset v2 | 10~12p | OCR → Knowledge Graph → Memory Object 변환 |
| 14 | UX/UI Requirements | 8~10p | Minimal Interface, Daily Mission, Review 화면 |
| 15 | Data & Event Logging | 6~8p | 학습 이벤트, 상태 업데이트, 분석 데이터 |
| 16 | Technical Architecture | 8~10p | Frontend, Backend, Local DB, AI Layer |
| 17 | MVP Requirements | 8~10p | 1차 구현 범위 및 Acceptance Criteria |
| 18 | Roadmap | 5~8p | MVP, V1, V2, V3 단계 |
| 19 | Risks & Open Questions | 5~8p | OCR 품질, AI 비용, 데이터 검수, 학습 지속성 |
| 20 | Appendix | 10p+ | JSON Schema, Sample Data, Prompt Example |

## 4. PRD 핵심 요구사항 요약

PRD는 다음 결론을 명확히 반영해야 한다. 첫째, 이 제품은 상용 서비스가 아니라 정도님 한 명을 위한 개인 학습 시스템이다. 둘째, Unit 기반 학습은 사용자 경험의 중심이 아니며, Unit은 출처와 검수 정보로만 유지한다. 셋째, 모든 학습은 Learning Object와 Memory Object 중심으로 재구성한다. 넷째, AI는 사용자의 외부 개인 정보가 아니라 앱 내부 학습 데이터만으로 개입한다. 다섯째, 제품의 성공 지표는 학습 완료율이 아니라 Long-term Usable Knowledge이다.

## 5. MVP 범위

MVP는 다음 기능을 포함한다. OCR 기반 Static Dataset을 Learning Object 단위로 재구성한다. 각 Learning Object에 의미, 문법, 예문, 유사 표현, 혼동 표현, 출처 정보를 부여한다. 사용자의 학습 이벤트를 기록하고, Memory Strength와 Mastery Score를 계산한다. Review Queue를 생성하고, Daily Session에서 신규 학습보다 복습을 우선한다. 퀴즈는 Recognition보다 Retrieval 중심으로 구성한다. AI Tutor는 정답 직접 제공보다 힌트, 비교, 회상 유도 중심으로 동작한다.

MVP에서 제외할 기능은 다음과 같다. 상용 결제, 다중 사용자 지원, 음성 인식 고도화, 커뮤니티, 리더보드, 복잡한 게임화, 모바일 네이티브 앱 동시 개발, 고급 분석 대시보드는 제외한다. MVP는 Web-first 또는 Local-first 개발 방식으로 빠르게 개인 학습 루프를 검증하는 데 집중한다.

## 6. PRD 작성 시 반드시 포함할 Decision Required 항목

최종 PRD 작성 전 결정이 필요한 항목은 다음과 같다.

| 결정 항목 | 기본 제안 | 비고 |
|---|---|---|
| 기술 스택 | Web-first, Local-first 우선 | 빠른 개발과 개인 사용 최적화 |
| DB | SQLite 또는 JSON + SQLite Hybrid | 학습 로그와 정적 데이터 분리 |
| AI 연동 | API 기반, Prompt Library 관리 | 프롬프트 버전 관리 필수 |
| UI | Minimal Dashboard 중심 | 메뉴보다 Today Mission 중심 |
| Dataset 검수 | OCR confidence + 수동 QA | 책 기반 OCR 오류 관리 필요 |
| 음성 기능 | MVP 이후 | Speaking은 중요하나 초기 범위 제외 가능 |

## 7. PRD와 하위 문서 관계

최종 PRD는 모든 하위 문서를 직접 포함하지 않고, 각 전문 영역으로 연결한다. Adaptive Engine의 상세 알고리즘은 `030_Learning_Engine_Spec.md`, Dataset 구조는 `040_Dataset_v2_Spec.md`, AI Tutor 동작 원칙은 `050_AI_Tutor_Spec.md`, 데이터 스키마는 `060_Data_Model.md`, 구현 지시는 `080_Implementation_Guide.md`에서 관리한다.

## 8. 다음 작성 작업

다음 단계에서는 이 Outline을 기반으로 `020_PRD.md`를 실제 본문 형태로 확장한다. 단, 100페이지급 PRD 전체를 한 번에 작성하지 않고 Chapter 1~5, Chapter 6~10, Chapter 11~15, Chapter 16~20의 네 구간으로 나누어 작성한다. 각 구간 작성 후 문서 전체 일관성을 점검하고 Decision Log에 주요 변경 사항을 기록한다.

## Related Documents

- [000_Founding_Philosophy.md](./000_Founding_Philosophy.md)
- [001_Product_Constitution.md](./001_Product_Constitution.md)
- [010_Product_Vision.md](./010_Product_Vision.md)
- [030_Learning_Engine_Spec.md](./030_Learning_Engine_Spec.md)
- [040_Dataset_v2_Spec.md](./040_Dataset_v2_Spec.md)
