---
title: Product Constitution
document_id: 001_Product_Constitution
version: 2.0
status: Draft
language: ko-KR
owner: Jungdo Lee
project: Project Mnemosyne
last_updated: 2026-06-27
---

# Product Constitution

> 우리는 영어 코스를 만드는 것이 아니다. 우리는 인간의 학습을 최적화하는 AI 시스템을 만든다.

## 1. 문서의 지위

이 문서는 Project Mnemosyne의 최상위 제품 헌법이다. PRD, Learning Engine Specification, Dataset Specification, API Specification, UI/UX Guide, Prompt Library, Codex 작업 지시서 및 실제 구현 코드는 모두 이 문서의 원칙을 따른다. 이후 문서나 구현 결정이 본 문서와 충돌할 경우, 별도 Decision Log를 통해 헌법 개정 여부를 판단하기 전까지 본 문서가 우선한다.

## 2. 제품 정의

Project Mnemosyne은 AI 기반 Personal Learning Operating System이다. 첫 번째 적용 영역은 영어 phrasal verb 학습이지만, 제품의 본질은 영어 콘텐츠 전달이 아니라 학습자의 장기 기억을 운영하는 것이다. 따라서 이 제품은 교재 뷰어, 퀴즈 앱, 플래시카드 앱, 단어장 앱이 아니다. 이 제품은 학습자의 기억 상태를 관찰하고, 모델링하고, 최적의 학습 활동을 추천하고, 실제 사용 가능 지식으로 전환하는 개인 학습 운영체제이다.

## 3. 존재 이유

기존 학습 서비스는 콘텐츠를 제공하는 데 집중한다. 그러나 학습자가 실패하는 지점은 대개 콘텐츠 접근이 아니라 기억 유지와 실제 사용이다. 사용자는 내용을 읽고, 문제를 풀고, 점수를 확인하지만 시간이 지나면 잊는다. 특히 phrasal verb처럼 의미, 문법 패턴, 상황 맥락, 구어적 사용감이 함께 작동하는 표현은 단순 암기만으로는 장기 사용 능력으로 전환되기 어렵다. Project Mnemosyne은 이 실패 지점을 제품의 핵심 문제로 정의한다.

## 4. Vision

Project Mnemosyne의 Vision은 학습자의 두 번째 기억 시스템을 구축하는 것이다. AI는 사용자가 무엇을 배웠는지 기록하는 수준을 넘어, 무엇을 기억하고 있는지, 무엇을 잊어가고 있는지, 어떤 표현을 어떤 방식으로 다시 꺼내야 하는지를 지속적으로 판단해야 한다. 최종적으로 사용자는 오늘 무엇을 공부해야 하는지 고민하지 않고, 시스템이 제안하는 가장 작은 학습 단위를 수행함으로써 장기 기억을 강화한다.

## 5. Mission

Mission은 모든 학습 항목을 실제 사용 가능한 장기 기억으로 전환하는 것이다. 학습자는 표현을 알아보는 데서 멈추지 않고, 직접 떠올리고, 문장 안에서 적용하고, 대화 상황에서 사용할 수 있어야 한다. 학습 완료는 목표가 아니며, 실제 사용 가능성이 목표이다.

## 6. 우리가 믿는 것

우리는 기억이 학습보다 중요하다고 믿는다. 우리는 복습이 신규 학습보다 우선되어야 한다고 믿는다. 우리는 Recognition보다 Retrieval이 장기 기억에 더 중요하다고 믿는다. 우리는 정답률보다 장기 회상률이 더 중요하다고 믿는다. 우리는 Book은 Source이지 Curriculum이 아니라고 믿는다. 우리는 Learning Object가 Unit보다 중요하다고 믿는다. 우리는 Learner Model이 Content Model보다 중요하다고 믿는다. 우리는 AI가 Teacher라기보다 Coach이자 Memory Manager에 가까워야 한다고 믿는다. 우리는 좋은 학습 제품은 사용자를 오래 붙잡아두는 제품이 아니라, 사용자가 적은 시간으로 더 오래 기억하게 만드는 제품이라고 믿는다.

## 7. 우리가 두려워하는 것

우리가 가장 경계하는 실패는 사용자가 열심히 공부했지만 3개월 뒤 기억하지 못하는 것이다. 두 번째 실패는 사용자가 문제를 많이 풀었지만 실제 대화에서 사용하지 못하는 것이다. 세 번째 실패는 Adaptive Learning이 단순 추천 UI로 전락하는 것이다. 네 번째 실패는 AI가 학습자의 회상을 돕지 않고 정답과 설명을 너무 빨리 제공하는 것이다. 다섯 번째 실패는 Dataset이 책의 구조에 갇혀 개인화 학습 엔진의 발전을 제한하는 것이다.

## 8. 핵심 원칙

### Principle 1. Memory First

모든 설계의 최우선 기준은 장기 기억이다. 콘텐츠 진행, UI 편의성, 신규 기능, 게임화 요소가 장기 기억과 충돌할 경우 장기 기억을 우선한다.

### Principle 2. Learner Model Before Content Model

가장 중요한 데이터베이스는 콘텐츠 데이터베이스가 아니라 학습자 모델이다. 콘텐츠는 고정되어 있지만 학습자의 기억 상태는 매일 변한다. 제품은 고정 콘텐츠가 아니라 변화하는 기억 상태를 중심으로 동작해야 한다.

### Principle 3. Learning Object Before Unit

Unit은 책의 편집 구조일 뿐이며 학습자의 인지 구조가 아니다. 모든 콘텐츠는 Learning Object 단위로 분해되어야 하며, 학습 경로는 Unit 순서가 아니라 Learning Object별 기억 상태에 의해 결정된다.

### Principle 4. Adaptive Before Sequential

학습 순서는 고정되어서는 안 된다. 다음 학습 항목은 책의 다음 페이지가 아니라 학습자의 현재 기억 상태, 망각 위험, 오답 패턴, 회상 속도, 실제 사용 가능성에 의해 결정되어야 한다.

### Principle 5. Retrieval Before Recognition

객관식 문제는 보조 수단이다. 핵심은 스스로 떠올리는 능력이다. 가능한 경우 모든 학습 활동은 Recognition에서 Retrieval로, Retrieval에서 Application으로, Application에서 Conversation으로 확장되어야 한다.

### Principle 6. Review Before New Learning

새로운 학습보다 복습이 우선이다. 복습 대기열이 충분히 처리되지 않은 상태에서 신규 학습을 과도하게 제공해서는 안 된다. 시스템은 사용자의 성취감을 위해 새로운 콘텐츠를 밀어붙이지 말고, 장기 기억을 위해 필요한 복습을 우선시해야 한다.

### Principle 7. Conversation Before Memorization

언어는 사용하기 위한 것이다. 중요한 표현은 최종적으로 대화 맥락 안에서 사용되어야 한다. 뜻을 외우는 단계는 시작점이며, 대화에서 자연스럽게 사용할 수 있는 상태가 목표이다.

### Principle 8. Explainable AI

AI의 추천은 설명 가능해야 한다. 시스템은 “오늘 이 표현을 복습해야 하는 이유”, “이 문제 유형을 선택한 이유”, “이 표현을 아직 충분히 알고 있다고 판단한 이유”를 사용자와 개발자가 이해할 수 있도록 기록해야 한다.

### Principle 9. Minimal Interface, Deep Intelligence

UI는 단순해야 한다. 복잡성은 화면이 아니라 엔진 내부에 있어야 한다. 사용자는 많은 선택지를 보는 것이 아니라, 지금 가장 중요한 학습 행동을 명확하게 제안받아야 한다.

### Principle 10. Personal Use First

이 프로젝트는 상용화를 목표로 하지 않는다. 모든 설계는 불특정 다수가 아니라 정도님 한 명의 학습 효율과 지속성을 극대화하는 방향으로 최적화한다. 시장성, 범용성, 사용자 확장성은 현재 단계의 우선순위가 아니다.

## 9. 학습 원칙

Project Mnemosyne의 학습 흐름은 `Exposure → Recognition → Retrieval → Application → Conversation → Automaticity`를 따른다. 학습자는 먼저 표현에 노출되고, 의미를 알아보고, 스스로 떠올리고, 문장에 적용하고, 대화에 사용하고, 최종적으로 자동화한다. 모든 Learning Object는 이 단계 중 어느 지점에 있는지 상태값을 가져야 하며, Adaptive Engine은 다음 단계로 이동할지, 복습할지, 다른 표현과 비교할지를 결정해야 한다.

## 10. AI 원칙

AI는 사용자의 모든 개인 정보를 알 필요가 없다. AI는 학습 프로그램 내부에서 발생하는 행동 데이터만을 기반으로 개입해야 한다. 예를 들어 정답률, 오답 유형, 응답 시간, 복습 지연, Speaking Skip, 특정 표현의 반복 오류, 유사 표현 간 혼동을 기반으로 학습 상태를 추론한다. AI가 외부 생활 정보나 민감한 개인 정보를 전제로 추천하는 구조는 배제한다.

AI의 역할은 네 가지이다. 첫째, Observe: 학습 행동을 관찰한다. 둘째, Model: 학습자의 기억 상태를 모델링한다. 셋째, Recommend: 다음 학습 행동을 추천한다. 넷째, Coach: 정답을 바로 주지 않고 학습자의 회상을 촉진한다.

## 11. 데이터 원칙

데이터는 Static Dataset과 Dynamic Dataset으로 분리한다. Static Dataset은 OCR 원문, Source Reference, Learning Object, Knowledge Graph, Grammar Pattern, Quiz Template, Answer Graph처럼 콘텐츠 자체와 관련된 데이터이다. Dynamic Dataset은 Learner Profile, Memory Strength, Mastery Score, Review Queue, Mistake History, Conversation History, Speaking History, AI Notes처럼 학습자의 상태와 관련된 데이터이다.

Book Source는 Provenance로만 유지한다. Cambridge 교재의 Unit, Page, Exercise 정보는 출처와 검수 목적으로 보존하되, 사용자 학습 경로의 Primary Key로 사용하지 않는다. Primary Key는 Learning Object와 Memory Object이다.

## 12. 엔지니어링 원칙

시스템은 모듈형으로 설계한다. 핵심 컴포넌트는 Learning Object Repository, Knowledge Graph, Learner Model, Memory Engine, Adaptive Engine, Review Engine, AI Tutor, Prompt Library로 분리한다. 각 컴포넌트는 가능한 한 독립적으로 테스트 가능해야 하며, 데이터 스키마는 Markdown 문서와 JSON Schema로 함께 관리한다.

모든 학습 활동은 Event Log로 남겨야 한다. Event Log는 Learner Model을 업데이트하는 원천이며, 향후 Adaptive Engine 개선의 기반이다. AI Prompt는 코드에 하드코딩하지 않고 Prompt Library에서 관리하며, 프롬프트 변경도 버전 관리 대상이다.

## 13. UX 원칙

사용자는 오늘 무엇을 공부해야 할지 고민하지 않아야 한다. 첫 화면은 가능한 한 단순해야 하며, “오늘 해야 할 가장 중요한 학습 행동”을 중심으로 구성한다. 성인 학습자를 대상으로 하므로 과도한 배지, 포인트, 캐릭터, 게임화는 지양한다. 동기부여는 장식이 아니라 “내가 실제로 기억하고 있다”는 감각에서 나와야 한다.

## 14. 기능 판단 기준

새로운 기능은 다음 질문을 통과해야 한다. 이 기능은 장기 기억을 향상시키는가? Retrieval을 증가시키는가? Adaptive Engine을 강화하는가? Learner Model을 더 정확하게 만드는가? Cognitive Load를 줄이는가? AI가 수행할 때 명확한 가치가 있는가? 추천 이유를 설명할 수 있는가? 데이터 구조를 오염시키지 않는가? 유지보수가 가능한가? 정도님 한 명의 실제 학습 효율에 기여하는가?

## 15. 만들지 않을 것

우리는 Unit 순서대로 강제 진행하는 제품을 만들지 않는다. 객관식 문제 중심의 제품을 만들지 않는다. 점수와 배지 중심의 게임화 제품을 만들지 않는다. 사용자의 학습 시간을 늘리는 것을 목표로 하지 않는다. AI가 정답을 즉시 설명하고 끝내는 제품을 만들지 않는다. 모든 사용자에게 동일한 학습 경로를 제공하는 제품을 만들지 않는다. 기억 상태와 무관하게 신규 콘텐츠를 밀어붙이는 제품을 만들지 않는다.

## 16. KPI

최상위 KPI는 Long-term Usable Knowledge이다. 보조 KPI는 Long-term Recall Accuracy, Average Memory Strength, Review Completion Rate, Forgotten Knowledge Recovery Rate, Conversation Success Rate, Active Vocabulary Growth, Response Latency Improvement이다. 단기 정답률, 학습 시간, 완료 Unit 수는 보조 참고 지표로만 사용한다.

## 17. 문서 원칙

모든 공식 문서는 한국어 Markdown으로 작성한다. 문서는 사람이 읽기 위한 설명서이자 Codex, Claude Code, Cursor가 실행 가능한 개발 지시서여야 한다. 모든 문서는 Git으로 관리하며, 문서 간 링크를 유지한다. 주요 설계 변경은 Decision Log에 기록한다.

## 18. North Star

Project Mnemosyne의 North Star는 Long-term Usable Knowledge이다. 모든 설계 결정은 하나의 질문으로 귀결된다. “이 결정은 학습자가 몇 달 뒤에도 해당 지식을 자연스럽게 회상하고 사용할 가능성을 높이는가?” 답이 명확하지 않다면 해당 기능, 데이터 구조, UI, AI 동작은 재검토한다.

## Related Documents

- [000_Founding_Philosophy.md](./000_Founding_Philosophy.md)
- [010_Product_Vision.md](./010_Product_Vision.md)
- [020_PRD.md](./020_PRD.md)
- [030_Learning_Engine_Spec.md](./030_Learning_Engine_Spec.md)
- [040_Dataset_v2_Spec.md](./040_Dataset_v2_Spec.md)
- [090_Decision_Log.md](./090_Decision_Log.md)
