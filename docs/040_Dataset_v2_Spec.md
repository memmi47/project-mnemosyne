---
title: Dataset v2 Specification
document_id: 040_Dataset_v2_Spec
version: 0.2
status: Draft
language: ko-KR
project: Project Mnemosyne
last_updated: 2026-06-27
---

# Dataset v2 Specification

## 목적

Dataset v2는 OCR 결과를 AI 학습 엔진이 사용할 수 있는 구조화 데이터로 변환하는 규격이다. 핵심 목표는 **책 중심 구조를 Learning Object 중심 구조로 완전히 재구성**하는 것이다.

## 데이터 계층

```text
PDF
  ↓
OCR Raw
  ↓
OCR Corrected
  ↓
Source Reference
  ↓
Learning Object
  ↓
Knowledge Graph
  ↓
Quiz Template
  ↓
Answer Graph
  ↓
Memory Object(실행 시 생성)
```

## 디렉터리 구조

```text
dataset/
 ├── source/
 │    ├── pdf/
 │    ├── ocr_raw/
 │    ├── markdown/
 │    └── answer_key/
 ├── static/
 │    ├── learning_objects.json
 │    ├── semantic_tags.json
 │    ├── grammar_patterns.json
 │    └── context_tags.json
 ├── graph/
 │    ├── knowledge_graph.json
 │    ├── confusion_pairs.json
 │    └── similarity_edges.json
 ├── templates/
 │    ├── recognition.json
 │    ├── retrieval.json
 │    ├── application.json
 │    └── conversation.json
 └── metadata/
      ├── source_reference.json
      └── dataset_version.json
```

## Learning Object 필수 스키마

|필드|설명|
|---|---|
|learning_object_id|고유 ID|
|expression|phrasal verb|
|sense_id|의미 구분|
|base_verb|기본 동사|
|particle|particle|
|definition_en|영문 정의|
|definition_ko|한글 설명|
|grammar_pattern|문법|
|examples|예문|
|common_errors|자주 틀리는 패턴|
|confusion_targets|혼동 표현|
|business_examples|비즈니스 예문|
|source_reference|원본 위치|

## Source Reference

```json
{
 "unit":12,
 "page":58,
 "exercise":"A",
 "line":14,
 "answer_ref":"ans_012_04"
}
```

## Answer Graph

문제는 정답을 직접 보유하지 않는다.

```text
Question
   │
answer_ref
   │
Answer Graph
```

이를 통해 OCR 수정 시 문제 데이터 변경 없이 정답만 수정할 수 있다.

## Knowledge Graph Edge

```json
{
 "source":"look_up",
 "target":"look_into",
 "relation":"confused_with",
 "weight":0.86
}
```

지원 관계는 다음과 같다.

- confused_with
- synonym
- opposite
- same_base_verb
- same_context
- same_grammar
- prerequisite

## Quiz Template

모든 문제는 템플릿으로 저장한다.

|Template|목적|
|---|---|
|recognition|의미 인식|
|retrieval|직접 회상|
|application|문장 생성|
|conversation|대화 적용|

## OCR 변환 파이프라인

```text
OCR
 ↓
자동 정규화
 ↓
문장 분리
 ↓
Learning Object 추출
 ↓
Grammar Parsing
 ↓
Tag 생성
 ↓
Knowledge Graph 연결
 ↓
Quiz Template 생성
 ↓
Answer Graph 연결
 ↓
JSON Export
```

## 검수 상태

|상태|의미|
|---|---|
|raw|OCR 직후|
|normalized|자동 정규화 완료|
|review_required|수동 검수 필요|
|verified|검수 완료|
|released|앱 사용 가능|

## 완료 기준

- 모든 표현이 Learning Object로 분리
- 모든 문제가 Answer Graph와 연결
- 모든 표현이 최소 1개의 Quiz Template 보유
- 모든 표현이 Knowledge Graph에 연결
- OCR 원본 추적 가능
