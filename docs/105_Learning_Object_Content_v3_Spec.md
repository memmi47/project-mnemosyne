---
title: Learning Object Content v3 Specification
document_id: 105_Learning_Object_Content_v3_Spec
version: 3.0
status: Released Draft
language: ko-KR
project: Project Mnemosyne
last_updated: 2026-06-27
---

# Learning Object Content v3 Specification

v3.0에서는 Learning Object를 단순 표현-뜻 레코드가 아니라 독립적인 학습 콘텐츠 패키지로 확장한다. 각 Learning Object는 최소 3개 이상의 예문, 6개 이상의 문제 유형, 2개 이상의 common mistake, 3단계 hint, learning path를 포함한다.

| 항목 | 최소 수량 | 목적 |
|---|---:|---|
| Book/OCR/Generated Examples | 3 | 문맥 기반 학습 |
| Exercises | 6 | Recognition → Conversation 단계 학습 |
| Common Mistakes | 2 | 오답 기반 복습 |
| Hints | 3 | 정답 즉시 공개 방지 |
| Learning Path | 6 단계 | 점진적 공개 |

문제 유형은 recognition, retrieval, fill_blank, context_choice, sentence_production, conversation_turn을 기본으로 한다. Book/OCR 기반 예문은 원천 PDF의 OCR 결과를 활용하므로 `review_required` 상태이다. Generated 예문과 문제는 MVP 학습 흐름을 가능하게 하는 scaffold이며, 실제 학습 품질을 높이기 위해 후속 QA가 필요하다.
