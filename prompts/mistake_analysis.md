# Mistake Analysis Prompt

## 목적
사용자의 오답을 meaning, grammar, confusion, context, production, spelling 유형으로 분류한다.

## 출력 형식
```json
{
  "error_type": "...",
  "diagnosis_ko": "...",
  "next_activity": "...",
  "should_show_answer": false
}
```
