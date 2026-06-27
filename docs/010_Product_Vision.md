---
title: Product Vision
document_id: 010_Product_Vision
version: 1.0
status: Draft
language: ko-KR
owner: Jungdo Lee
project: Project Mnemosyne
last_updated: 2026-06-27
---

# Product Vision

## 1. 한 문장 정의

Project Mnemosyne은 영어 phrasal verb를 시작점으로 삼아, 학습자의 기억 상태를 지속적으로 모델링하고 장기 사용 가능 지식을 극대화하는 AI 기반 Personal Learning OS이다.

## 2. 제품 비전

Project Mnemosyne의 비전은 학습자가 “무엇을 공부해야 할지” 고민하지 않아도 되는 학습 환경을 만드는 것이다. 기존 학습 앱은 콘텐츠를 나열하고 사용자가 순서대로 선택하게 만든다. 그러나 실제 학습 효율은 사용자가 무엇을 선택했는지가 아니라, 지금 기억에서 사라지기 직전의 지식을 적절한 방식으로 다시 꺼내는지에 의해 결정된다. 이 제품은 학습자의 기억 상태를 중심으로 오늘 학습할 항목, 문제 유형, 복습 간격, 대화 연습 여부를 결정한다.

이 제품은 상용화를 목표로 하지 않는다. 불특정 다수의 평균적인 사용자를 만족시키는 것보다, 정도님 한 명의 영어 학습 효율과 지속성을 극대화하는 것이 더 중요하다. 따라서 제품 설계는 시장성, 온보딩 대중성, 범용 UX보다 개인화 정확도, 복습 효율, 장기 기억 강화, 실제 사용 가능성을 우선한다.

## 3. 문제 정의

성인 학습자의 가장 큰 문제는 의지 부족이 아니라 기억 유지의 실패이다. 특히 직장인은 학습 시간이 제한되어 있고, 매일 같은 시간에 긴 학습 세션을 유지하기 어렵다. 따라서 학습 시스템은 긴 시간을 요구해서는 안 되며, 적은 시간 안에 가장 높은 기억 강화 효과를 내야 한다. 이를 위해 제품은 “학습량 최대화”가 아니라 “기억 효율 최대화”를 목표로 해야 한다.

Phrasal verb는 단순 단어보다 학습 난이도가 높다. 하나의 표현이 여러 의미를 가질 수 있고, 타동사·자동사 여부, 목적어 분리 가능성, 상황별 자연스러움, 유사 표현과의 차이가 동시에 작동한다. 따라서 단순 뜻 암기나 객관식 문제만으로는 충분하지 않다. 학습자는 표현의 의미를 알고, 비슷한 표현과 구분하고, 문장 안에서 적용하고, 실제 대화에서 사용할 수 있어야 한다.

## 4. 대상 사용자

이 제품의 1차 사용자는 정도님 한 명이다. 사용자는 전략컨설팅 및 반도체 산업 전략 업무를 수행하는 성인 직장인으로, 영어 학습의 목적은 시험 점수보다는 실제 업무 커뮤니케이션, 회의, 네트워킹, 리서치, 해외 전문가와의 대화에서 자연스러운 표현력을 높이는 데 있다. 따라서 콘텐츠와 예문은 일반 생활 영어에만 머물러서는 안 되며, 필요할 경우 비즈니스 상황, 기술 산업, 투자, 전략 토론 맥락으로 확장 가능해야 한다.

## 5. 제품의 차별화

기존 영어 학습 앱은 대체로 콘텐츠, 퀴즈, 게임화, 연속 학습일에 집중한다. Project Mnemosyne은 이들과 다르게 학습자의 기억 상태를 제품의 중심 데이터로 삼는다. 차별화는 더 많은 문제를 제공하는 것이 아니라, 오늘 하지 않아도 되는 학습을 제거하고 꼭 필요한 학습만 제시하는 데 있다.

| 구분 | 기존 학습 앱 | Project Mnemosyne |
|---|---|---|
| 학습 기준 | 커리큘럼 순서 | 기억 상태 |
| 핵심 데이터 | 콘텐츠 진도 | Learner Model |
| 주요 활동 | 문제 풀이 | Retrieval, Review, Conversation |
| AI 역할 | 설명 생성 | 기억 모델링 및 코칭 |
| 성공 기준 | 완료율, 정답률 | 장기 사용 가능 지식 |
| 사용자 범위 | 다수 사용자 | 단일 사용자 최적화 |

## 6. 핵심 제품 경험

사용자는 앱을 열었을 때 긴 메뉴를 보지 않는다. 사용자는 “오늘의 학습 판단”을 본다. 예를 들어 시스템은 “오늘은 신규 학습보다 복습이 우선입니다”, “최근 `put off`와 `put away`를 혼동하고 있으므로 비교 연습을 진행합니다”, “이 표현은 의미 인식은 안정적이지만 직접 문장 생성이 약합니다”와 같은 형태로 학습 이유를 설명해야 한다.

핵심 세션은 짧아야 한다. 기본 Daily Session은 10~15분을 기준으로 하며, 사용자의 피로도를 직접 알 수 없으므로 학습 앱 내부의 행동 데이터만으로 세션 강도를 조정한다. 예를 들어 최근 복습 지연, 응답 시간 증가, 오답률 상승, Speaking Skip 증가가 관찰되면 신규 학습량을 줄이고 핵심 복습과 짧은 회상 문제 중심으로 전환한다.

## 7. 학습 경험 원칙

제품은 학습자를 오래 붙잡아두는 것이 아니라, 적은 시간으로 기억을 오래 유지하게 만들어야 한다. 학습 경험은 다음 원칙을 따른다. 첫째, 복습 대기열이 신규 학습보다 우선한다. 둘째, 객관식은 초기 노출과 인식 확인에만 제한적으로 사용한다. 셋째, 모든 핵심 표현은 최종적으로 직접 회상과 문장 생성, 대화 적용으로 이어진다. 넷째, AI는 답을 빨리 알려주기보다 힌트, 비교, 질문을 통해 학습자의 회상을 유도한다. 다섯째, 학습 경로는 Unit이 아니라 Memory Strength와 Forgetting Risk에 의해 결정된다.

## 8. AI Tutor 비전

AI Tutor는 선생님이라기보다 Memory Coach이다. AI는 사용자가 모르는 내용을 설명하는 역할도 하지만, 더 중요한 역할은 사용자가 이미 배웠으나 잊어가는 지식을 다시 꺼내게 만드는 것이다. AI는 “정답은 X입니다”보다 “왜 이 표현이 떠오르지 않았는지”, “어떤 표현과 헷갈렸는지”, “이 상황에서 더 자연스러운 표현은 무엇인지”를 함께 다루어야 한다.

AI는 외부 개인 정보를 전제로 개입하지 않는다. 즉, 사용자의 일정, 피로도, 업무 상황을 모른다고 가정한다. 대신 학습 프로그램 내부에서 발생한 학습 행동 데이터만으로 개입한다. 이 제약은 제품의 한계가 아니라 오히려 설계 원칙이다. AI의 판단 근거가 학습 데이터에 집중되면 프라이버시 리스크가 줄고 추천 설명 가능성이 높아진다.

## 9. Dataset Vision

Dataset은 책의 Unit 구조를 보존하되, 그 구조에 종속되지 않는다. OCR 원문은 Source Layer로 유지하고, 실제 학습 시스템은 Learning Object, Knowledge Graph, Quiz Template, Answer Graph, Memory Object를 중심으로 동작한다. Unit, Page, Exercise는 출처와 검수 목적의 Provenance로 남긴다.

향후 Dataset은 다음 방향으로 확장된다. 첫째, 각 phrasal verb의 의미, 문법, 예문, 유사 표현, 혼동 표현, 비즈니스 맥락 예문을 구조화한다. 둘째, 각 Learning Object를 Knowledge Graph로 연결한다. 셋째, 각 Learning Object에 대해 Recognition, Retrieval, Application, Conversation 단계별 학습 활동을 생성한다. 넷째, 학습자의 Dynamic State와 연결하여 Memory Object를 생성한다.

## 10. 제품 성공의 정의

제품의 성공은 “Unit 70 완료”가 아니다. 성공은 30일, 90일, 180일 후에도 학습자가 주요 표현을 직접 회상하고 문장과 대화에서 사용할 수 있는가로 정의한다. 따라서 제품의 North Star는 Long-term Usable Knowledge이며, 핵심 지표는 장기 회상률, Memory Strength, Review Completion, Forgetting Recovery, Conversation Success가 되어야 한다.

## 11. MVP Vision

MVP는 완전한 AI Tutor를 구현하기보다, 제품 철학이 실제로 작동하는 최소 시스템을 만드는 것을 목표로 한다. MVP의 핵심은 1) OCR 기반 Static Dataset 정리, 2) Learning Object 단위 재구성, 3) Review Queue, 4) Mastery Score, 5) 기본 Adaptive Recommendation, 6) Retrieval 중심 퀴즈, 7) 간단한 학습 로그 저장이다.

MVP에서 제외할 항목도 명확히 한다. 고급 음성 평가, 복잡한 캐릭터형 게임화, 다중 사용자 계정, 상용 결제, 커뮤니티 기능, 범용 코스 마켓플레이스는 MVP 범위가 아니다. MVP는 정도님 한 명의 학습 루프가 실제로 작동하는지를 검증하는 데 집중한다.

## 12. 장기 확장 방향

장기적으로 Project Mnemosyne은 영어 phrasal verb를 넘어 idiom, business expression, meeting English, negotiation English, technical discussion English로 확장할 수 있다. 그러나 확장의 기준은 콘텐츠 추가가 아니라 Memory Engine의 재사용 가능성이다. 새로운 콘텐츠가 들어와도 Learning Object, Learner Model, Adaptive Engine, Review Engine 구조는 유지되어야 한다.

## Related Documents

- [000_Founding_Philosophy.md](./000_Founding_Philosophy.md)
- [001_Product_Constitution.md](./001_Product_Constitution.md)
- [020_PRD.md](./020_PRD.md)
- [030_Learning_Engine_Spec.md](./030_Learning_Engine_Spec.md)
- [040_Dataset_v2_Spec.md](./040_Dataset_v2_Spec.md)
