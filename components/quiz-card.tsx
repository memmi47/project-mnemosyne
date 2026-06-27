"use client";

import type { SubmitAnswerResponse } from "@/src/services/answer-service";
import type { HintResponse } from "@/src/services/hint-service";
import type { SessionSummary } from "@/src/services/session-service";
import type { SkipItemResponse } from "@/src/services/skip-service";
import type { ActivityType, ContentV3Example, LearningObject, MemoryObject, QuizTemplate, Recommendation } from "@/src/domain/models";
import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo, useState } from "react";

interface QuizCardProps {
  initialMemory: MemoryObject | null;
  learningObject: LearningObject | null;
  quizTemplate: QuizTemplate | null;
  quizTemplates: QuizTemplate[];
  recommendation: Recommendation | null;
}

export function QuizCard({
  initialMemory,
  learningObject,
  quizTemplate,
  quizTemplates,
  recommendation,
}: QuizCardProps) {
  const orderedQuizTemplates = useMemo(
    () => orderQuizTemplates(quizTemplates, learningObject?.learning_path),
    [learningObject?.learning_path, quizTemplates]
  );
  const [activeTemplateId, setActiveTemplateId] = useState(
    () => quizTemplate?.template_id ?? orderedQuizTemplates[0]?.template_id ?? null
  );
  const currentQuizTemplate =
    orderedQuizTemplates.find((template) => template.template_id === activeTemplateId) ??
    quizTemplate ??
    orderedQuizTemplates[0] ??
    null;
  const activeActivityType = currentQuizTemplate?.activity_type ?? recommendation?.activity_type ?? "retrieval";
  const activeTemplateIndex = currentQuizTemplate
    ? orderedQuizTemplates.findIndex((template) => template.template_id === currentQuizTemplate.template_id)
    : -1;
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
  const [hint, setHint] = useState<HintResponse | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [attemptCount, setAttemptCount] = useState(1);
  const [revealedExampleCount, setRevealedExampleCount] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const sessionId = useMemo(() => `session_${Date.now()}`, []);
  const form = useForm({
    defaultValues: {
      answer: "",
    },
    onSubmit: async ({ value }) => {
      if (!recommendation) return;

      setIsSubmitting(true);

      try {
        const response = await fetch("/api/answer/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            learning_object_id: recommendation.learning_object_id,
            activity_type: activeActivityType,
            answer: value.answer,
            response_latency_ms: Date.now() - startedAt,
            hint_used: Boolean(hint),
            attempt_count: attemptCount,
          }),
        });

        const data = (await response.json()) as SubmitAnswerResponse | { error: string };
        if (!response.ok || "error" in data) {
          throw new Error("error" in data ? data.error : "답안 제출에 실패했습니다.");
        }

        setResult(data);
        setHint(null);
        setStartedAt(Date.now());
        if (data.is_correct) {
          form.reset();
        } else {
          setAttemptCount((current) => current + 1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!recommendation) return;

    void fetch("/api/session/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        learning_object_id: recommendation.learning_object_id,
        activity_type: activeActivityType,
      }),
    });
  }, [activeActivityType, recommendation, sessionId]);

  if (!recommendation) {
    return (
      <section className="border border-mist bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-ink">오늘 진행할 항목이 없습니다.</h1>
      </section>
    );
  }

  const prompt = currentQuizTemplate?.prompt ?? buildFallbackPrompt(learningObject, activeActivityType);
  const instruction = currentQuizTemplate?.instruction_ko ?? buildFallbackInstruction(activeActivityType);
  const activityLabel = getActivityLabel(activeActivityType);
  const applicationTemplate = quizTemplates.find(
    (template) => template.activity_type === "sentence_production" || template.activity_type === "application"
  );
  const nextReviewAt = result?.updated_memory.next_review_at ?? initialMemory?.next_review_at ?? null;
  const memoryStrength = Math.round(result?.updated_memory.memory_strength ?? initialMemory?.memory_strength ?? 0);
  const masteryScore = Math.round(result?.updated_memory.mastery_score ?? initialMemory?.mastery_score ?? 0);
  const forgettingRisk = Math.round(result?.updated_memory.forgetting_risk ?? initialMemory?.forgetting_risk ?? 0);
  const examples = collectContentExamples(learningObject);
  const revealedExamples = examples.slice(0, revealedExampleCount);
  const canRevealMoreExamples = revealedExampleCount < examples.length;
  const commonMistakes = learningObject?.common_mistakes ?? [];

  function handleTemplateChange(template: QuizTemplate) {
    setActiveTemplateId(template.template_id);
    setResult(null);
    setHint(null);
    setAttemptCount(1);
    setRevealedExampleCount(0);
    setStartedAt(Date.now());
    form.reset();
  }

  function handleNextTemplate() {
    const nextTemplate = orderedQuizTemplates[activeTemplateIndex + 1];
    if (nextTemplate) handleTemplateChange(nextTemplate);
  }

  async function handleHintRequest() {
    if (!recommendation) return;

    setIsHintLoading(true);
    try {
      const response = await fetch("/api/hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          learning_object_id: recommendation.learning_object_id,
          activity_type: activeActivityType,
          attempt_count: attemptCount,
        }),
      });
      const data = (await response.json()) as HintResponse;
      setHint(data);
    } finally {
      setIsHintLoading(false);
    }
  }

  async function handleCompleteSession() {
    setIsCompleting(true);
    try {
      const response = await fetch("/api/session/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });
      const data = (await response.json()) as SessionSummary;
      setSummary(data);
    } finally {
      setIsCompleting(false);
    }
  }

  async function handleSkipItem() {
    if (!recommendation) return;

    setIsSkipping(true);
    try {
      const response = await fetch("/api/item/skip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          learning_object_id: recommendation.learning_object_id,
          activity_type: activeActivityType,
        }),
      });
      const data = (await response.json()) as SkipItemResponse;
      setResult({
        is_correct: false,
        correct_answer: null,
        can_reveal_answer: false,
        feedback_ko: data.feedback_ko,
        updated_memory: data.updated_memory,
      });
      setHint(null);
      setAttemptCount((current) => current + 1);
    } finally {
      setIsSkipping(false);
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="border border-mist bg-white shadow-sm">
        <div className="border-b border-mist p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-primary px-2.5 py-1 text-xs font-black uppercase tracking-[0.14em] text-white">
              Today Mission
            </span>
            <span className="bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">
              {activityLabel}
            </span>
            <span className="bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
              시도 {attemptCount}
            </span>
            {activeTemplateIndex >= 0 ? (
              <span className="bg-surface px-2.5 py-1 text-xs font-bold text-muted">
                {activeTemplateIndex + 1}/{orderedQuizTemplates.length}
              </span>
            ) : null}
          </div>

          {orderedQuizTemplates.length > 1 ? (
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {orderedQuizTemplates.map((template, index) => {
                const isActive = template.template_id === currentQuizTemplate?.template_id;

                return (
                  <button
                    className={`min-h-11 border px-3 text-left text-xs font-black transition ${
                      isActive
                        ? "border-primary bg-primary text-white"
                        : "border-mist bg-white text-muted hover:bg-surface"
                    }`}
                    key={template.template_id}
                    onClick={() => handleTemplateChange(template)}
                    type="button"
                  >
                    {index + 1}. {getActivityLabel(template.activity_type)}
                  </button>
                );
              })}
            </div>
          ) : null}

          <p className="mt-6 text-sm font-black text-primary">{instruction}</p>
          <h1 className="mt-3 max-w-3xl text-2xl font-black leading-9 text-ink md:text-3xl md:leading-10">
            {prompt}
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-bold leading-6 text-muted">
            먼저 직접 떠올리고, 막히면 예문을 하나씩 열어 문장 속 쓰임으로 추정하세요.
          </p>
        </div>

        <div className="p-5 md:p-6">
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <form.Field name="answer">
              {(field) => (
                <>
                  <label className="text-sm font-bold text-ink" htmlFor={field.name}>
                    내 답
                  </label>
                  <input
                    className="h-14 border border-mist bg-paper px-4 text-lg font-bold text-ink outline-none transition placeholder:text-faint focus:border-primary focus:bg-white"
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="phrasal verb 입력"
                    type="text"
                    value={field.state.value}
                  />
                  {currentQuizTemplate?.choices.length ? (
                    <div className="grid gap-2 md:grid-cols-2">
                      {currentQuizTemplate.choices.map((choice) => (
                        <button
                          className={`min-h-11 border px-3 text-left text-sm font-bold transition ${
                            field.state.value === choice
                              ? "border-primary bg-primary-soft text-primary"
                              : "border-mist bg-white text-ink hover:bg-surface"
                          }`}
                          key={choice}
                          onClick={() => field.handleChange(choice)}
                          type="button"
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </form.Field>
            <div className="grid gap-3 md:grid-cols-[1fr_160px]">
              <button
                className="h-12 bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-faint"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "채점 중" : "답안 제출"}
              </button>
              <button
                className="h-12 border border-primary px-4 text-sm font-bold text-primary transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:text-faint"
                disabled={isHintLoading}
                onClick={() => void handleHintRequest()}
                type="button"
              >
                {isHintLoading ? "힌트 생성 중" : "힌트"}
              </button>
            </div>
          </form>

          <div className="mt-5 border border-mist bg-paper p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Usage Examples</p>
                <p className="mt-1 text-sm font-bold text-muted">
                  예문을 하나씩 열어 실제 문장 속 쓰임을 추정합니다.
                </p>
              </div>
              <button
                className="h-10 border border-primary px-4 text-sm font-bold text-primary transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:border-mist disabled:text-faint"
                disabled={!canRevealMoreExamples}
                onClick={() => setRevealedExampleCount((current) => Math.min(current + 1, examples.length))}
                type="button"
              >
                {canRevealMoreExamples ? "예문 열기" : "예문 모두 열림"}
              </button>
            </div>

            {revealedExamples.length ? (
              <div className="mt-4 space-y-3">
                {revealedExamples.map((example, index) => (
                  <ExampleCard
                    example={example}
                    expression={learningObject?.expression ?? ""}
                    isAnswerVisible={Boolean(result?.is_correct)}
                    key={`${example.text}-${index}`}
                    order={index + 1}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm font-bold leading-6 text-muted">
                필요할 때만 예문을 여세요. 예문을 많이 볼수록 회상 난이도는 낮아집니다.
              </p>
            )}
          </div>

          {hint ? (
            <div className="mt-5 border border-mist bg-accent-soft p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-accent">{hint.mode}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-ink">{hint.hint_ko}</p>
            </div>
          ) : null}

          {result ? (
            <div className={`mt-5 border p-4 ${result.is_correct ? "border-primary bg-primary-soft" : "border-mist bg-paper"}`}>
              <p className="text-sm font-black text-ink">{result.feedback_ko}</p>
              {result.correct_answer ? (
                <p className="mt-2 text-sm text-muted">
                  확인한 표현: <span className="font-black text-primary">{result.correct_answer}</span>
                </p>
              ) : null}
              {!result.can_reveal_answer && !result.is_correct ? (
                <p className="mt-2 text-sm font-bold text-muted">
                  아직 정답 공개 전입니다. 힌트 또는 재시도로 회상 기록을 남기세요.
                </p>
              ) : null}
            </div>
          ) : null}

          {result?.is_correct && applicationTemplate ? (
            <div className="mt-5 border border-mist bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                다음 단계: 실제 활용
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-ink">{applicationTemplate.prompt}</p>
              {activeTemplateIndex < orderedQuizTemplates.length - 1 ? (
                <button
                  className="mt-4 h-10 border border-primary px-4 text-sm font-bold text-primary transition hover:bg-primary-soft"
                  onClick={handleNextTemplate}
                  type="button"
                >
                  다음 문제 유형
                </button>
              ) : null}
            </div>
          ) : null}

          {result && commonMistakes.length ? (
            <div className="mt-5 border border-mist bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Common Mistake</p>
              <MistakeCard mistake={commonMistakes[0]} />
            </div>
          ) : null}

          {summary ? (
            <div className="mt-5 border border-mist bg-paper p-4">
              <p className="text-sm font-black text-ink">세션 기록</p>
              <dl className="mt-3 grid gap-2 text-sm text-muted md:grid-cols-3">
                <SummaryMetric label="답변" value={summary.answered_count} />
                <SummaryMetric label="정답" value={summary.correct_count} />
                <SummaryMetric label="힌트" value={summary.hint_count} />
              </dl>
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button
              className="h-10 border border-mist px-4 text-sm font-bold text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:text-faint"
              disabled={isCompleting}
              onClick={() => void handleCompleteSession()}
              type="button"
            >
              {isCompleting ? "기록 정리 중" : "세션 완료"}
            </button>
            <button
              className="h-10 border border-mist px-4 text-sm font-bold text-muted transition hover:bg-surface disabled:cursor-not-allowed disabled:text-faint"
              disabled={isSkipping}
              onClick={() => void handleSkipItem()}
              type="button"
            >
              {isSkipping ? "복습 큐 저장 중" : "나중에 다시"}
            </button>
          </div>
        </div>
      </div>

      <aside className="border border-mist bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Memory Coach</p>
        <p className="mt-3 text-sm font-bold leading-6 text-ink">{recommendation.reason}</p>
        <div className="mt-5 space-y-4 border-t border-mist pt-5">
          <CoachMetric label="Memory Strength" value={memoryStrength} />
          <CoachMetric label="Mastery Score" value={masteryScore} />
          <CoachMetric label="Forgetting Risk" value={forgettingRisk} />
        </div>
        <div className="mt-5 border-t border-mist pt-4">
          <p className="text-xs font-bold text-muted">다음 복습</p>
          <p className="mt-2 text-sm font-black text-ink">
            {nextReviewAt ? formatDate(nextReviewAt) : "풀이 후 자동 예약"}
          </p>
        </div>
      </aside>
    </section>
  );
}

function ExampleCard({
  example,
  expression,
  isAnswerVisible,
  order,
}: {
  example: ContentV3Example;
  expression: string;
  isAnswerVisible: boolean;
  order: number;
}) {
  const text = isAnswerVisible ? example.text : maskExpression(example.text, expression);

  return (
    <div className="border border-mist bg-white p-3">
      <p className="text-xs font-bold text-muted">예문 {order} · {example.type}</p>
      <p className="mt-2 text-sm font-black leading-6 text-ink">{text}</p>
    </div>
  );
}

function MistakeCard({
  mistake,
}: {
  mistake: NonNullable<LearningObject["common_mistakes"]>[number];
}) {
  return (
    <div className="mt-3">
      <p className="text-sm font-black leading-6 text-ink">{mistake.wrong}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-muted">{mistake.correction}</p>
    </div>
  );
}

function CoachMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-muted">{label}</p>
        <p className="text-sm font-black text-ink">{value}</p>
      </div>
      <div className="mt-2 h-2 bg-mist">
        <div className="h-2 bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-mist bg-white p-3">
      <dt className="text-xs font-bold text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-black text-ink">{value}</dd>
    </div>
  );
}

function buildFallbackPrompt(learningObject: LearningObject | null, activityType: string): string {
  if (activityType === "application" || activityType === "sentence_production") {
    return `"${learningObject?.expression ?? "target expression"}"를 사용해 짧은 영어 문장을 만드세요.`;
  }

  const definition = learningObject?.definition_ko || learningObject?.definition_en || "제시된 의미";
  return `"${definition}"에 해당하는 phrasal verb를 입력하세요.`;
}

function buildFallbackInstruction(activityType: string): string {
  if (activityType === "fill_blank") return "빈칸에 들어갈 표현을 문맥으로 추정하세요.";
  if (activityType === "context_choice") return "문맥에 가장 자연스러운 표현을 고르세요.";
  if (activityType === "sentence_production") return "표현을 직접 문장 안에서 사용하세요.";
  if (activityType === "conversation_turn") return "대화 흐름에 맞는 답변을 작성하세요.";
  return "뜻을 보고 표현을 직접 회상하세요.";
}

function getActivityLabel(activityType: string): string {
  if (activityType === "recognition") return "Recognition";
  if (activityType === "retrieval" || activityType === "review" || activityType === "new_learning") {
    return "Recall";
  }

  if (activityType === "fill_blank") return "Cloze";
  if (activityType === "context_choice") return "Context";
  if (activityType === "sentence_production") return "Sentence";
  if (activityType === "application") return "Use in sentence";
  if (activityType === "conversation_turn") return "Conversation";
  if (activityType === "contrast") return "Compare";
  if (activityType === "conversation") return "Conversation";
  return activityType;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function collectContentExamples(learningObject: LearningObject | null): ContentV3Example[] {
  const generated = learningObject?.examples_v3?.generated_examples ?? [];
  const book = learningObject?.examples_v3?.book_examples ?? [];
  return [...generated, ...book].filter((example) => isUsableSentence(example.text)).slice(0, 4);
}

function orderQuizTemplates(templates: QuizTemplate[], learningPath?: ActivityType[]): QuizTemplate[] {
  const path = learningPath?.length
    ? learningPath
    : ["recognition", "retrieval", "fill_blank", "context_choice", "sentence_production", "conversation_turn"];

  return [...templates].sort((a, b) => {
    const orderA = path.indexOf(a.activity_type);
    const orderB = path.indexOf(b.activity_type);
    const normalizedA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA;
    const normalizedB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB;
    return normalizedA - normalizedB;
  });
}

function isUsableSentence(text: string): boolean {
  return text.includes(" ") && !text.trim().startsWith("{");
}

function maskExpression(text: string, expression: string): string {
  if (!expression) return text;
  return text.replace(new RegExp(escapeRegExp(expression), "gi"), "_____");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
