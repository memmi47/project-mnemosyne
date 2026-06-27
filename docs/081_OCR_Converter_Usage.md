---
title: OCR Converter Usage
document_id: 081_OCR_Converter_Usage
version: 0.1
status: Draft
language: ko-KR
project: Project Mnemosyne
last_updated: 2026-06-27
---

# OCR Converter Usage

## 목적

이 문서는 `scripts/convert_ocr_to_learning_objects.py`의 사용 방법을 정의한다. 이 스크립트는 OCR 또는 Markdown 원문에서 phrasal verb 후보를 추출하여 `Learning Object Draft`를 생성한다.

## 입력 위치

```text
dataset/source/ocr_raw/*.txt
dataset/source/markdown/*.md
```

## 실행 방법

```bash
python scripts/convert_ocr_to_learning_objects.py
```

## 출력 위치

```text
dataset/processed/learning_objects.draft.json
dataset/processed/source_references.draft.json
dataset/processed/conversion_report.json
```

## 주의사항

이 변환기는 검수 완료 데이터셋을 생성하지 않는다. 목적은 후보 추출과 구조화 초안 생성이다. 모든 출력 객체는 기본적으로 `review_required` 상태로 생성되며, definition, grammar_pattern, separability, transitivity, semantic_tags는 후속 enrichment 단계에서 채운다.

## 다음 보강 작업

1. OCR 원문에서 Unit, Section, Exercise 번호를 더 정확히 추출한다.
2. 정답지 Answer Graph와 연결한다.
3. Cambridge 원문 예문과 AI 생성 예문을 분리한다.
4. 같은 표현의 여러 의미를 sense 단위로 분리한다.
5. Knowledge Graph edge를 자동 생성한다.
