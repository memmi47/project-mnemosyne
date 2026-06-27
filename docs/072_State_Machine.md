---
title: Learning State Machine
document_id: 072_State_Machine
version: 1.0
status: Draft
language: ko-KR
project: Project Mnemosyne
last_updated: 2026-06-27
---

# Learning State Machine

## Learning Stage

```text
exposure → recognition → retrieval → application → conversation → automaticity
```

## 전환 조건

| From | To | 조건 |
|---|---|---|
| exposure | recognition | 최초 노출 후 recognition 문제 1회 시도 |
| recognition | retrieval | recognition 정답률 80% 이상 |
| retrieval | application | 직접 회상 2회 이상 성공 |
| application | conversation | 문장 생성 2회 이상 성공 |
| conversation | automaticity | 장기 복습 안정 및 대화 성공 |
| any | previous stage | 반복 오답 또는 memory_strength 급락 |

## 상태 후퇴

오답이 2회 이상 반복되거나 confusion_error가 발생하면 해당 Object는 이전 단계로 후퇴할 수 있다.
