"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { QuizTemplate, Recommendation, Example } from "@/src/domain/models";

interface LearningObjectData {
  learning_object_id: string;
  expression: string;
  definition_en: string;
  definition_ko: string;
  grammar_pattern: string;
  examples: Example[];
  base_verb: string;
  particles: string[];
  separability: string;
  unit?: number;
}

interface SessionItem {
  recommendation: Recommendation;
  learningObject: LearningObjectData;
  quizTemplates: QuizTemplate[];
}

export function SessionFlow({ items }: { items: SessionItem[] }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"exposure" | "quiz" | "summary">("exposure");
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [inputAnswer, setInputAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [results, setResults] = useState<Array<{ id: string; expression: string; isCorrect: boolean; userAnswer: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [isPending, startTransition] = useTransition();

  // TTS State for Premium Natural Voice
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [speechVoices, setSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      setSpeechVoices(window.speechSynthesis.getVoices());
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // 귀신 목소리 원천 차단: 고음질 원어민 음성 정밀 매칭 함수
  const speakExample = (text: string, index: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("현재 브라우저는 음성 합성(TTS)을 지원하지 않습니다.");
      return;
    }

    window.speechSynthesis.cancel(); // 기존 음성 재생 초기화

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95; // 너무 빠르거나 기계음 같지 않도록 최적의 속도 조정
    utterance.pitch = 1.0; // 자연스러운 피치

    if (speechVoices.length > 0) {
      // 1순위: Mac/iOS 및 Chrome의 대표적인 고음질 원어민 자연음성 리스트 우선 필터링
      const premiumVoices = ["Samantha", "Alex", "Victoria", "Google US English", "Daniel", "Karen", "Oliver", "Moira"];
      let selectedVoice = null;

      for (const name of premiumVoices) {
        selectedVoice = speechVoices.find((v) => v.name.includes(name) && v.lang.includes("en"));
        if (selectedVoice) break;
      }

      // 2순위: 위 리스트가 없을 경우 영어(en-US, en-GB) 기반의 자연스러운 여성/남성 음성 탐색
      if (!selectedVoice) {
        selectedVoice = speechVoices.find((v) => v.lang === "en-US" || v.lang === "en-GB");
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => setPlayingIndex(index);
    utterance.onend = () => setPlayingIndex(null);
    utterance.onerror = () => setPlayingIndex(null);

    window.speechSynthesis.speak(utterance);
  };

  const totalQuestions = items.length;
  const currentStep = currentIndex + 1;
  const currentItem = items[currentIndex];
  const progressPercent = totalQuestions > 0 ? Math.round((currentIndex / totalQuestions) * 100) : 0;

  if (phase === "summary" || currentIndex >= totalQuestions) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const wrongItems = results.filter((r) => !r.isCorrect);

    return (
      <div className="mx-auto max-w-xl px-5 py-12 animate-fade-in">
        <div className="overflow-hidden rounded-card border border-border bg-white p-8 text-center shadow-card sm:p-10">
          <div className="text-6xl animate-mn-pop">🎉</div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            세션 완료!
          </h1>
          <p className="mt-2 text-sm text-muted">
            총 {totalQuestions}문제 중 <strong className="text-primary font-bold">{correctCount}문제</strong> 정답
          </p>

          <div className="mt-8 flex justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f1f9" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={accuracy >= 80 ? "#00b894" : accuracy >= 50 ? "#fdcb6e" : "#fd7062"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="264"
                  strokeDashoffset={Math.max(0, 264 - (accuracy / 100) * 264)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-ink">{accuracy}%</span>
                <span className="text-[10px] font-bold tracking-widest text-faint uppercase mt-0.5">정답률</span>
              </div>
            </div>
          </div>

          {wrongItems.length > 0 ? (
            <div className="mt-10 text-left">
              <p className="text-xs font-extrabold tracking-wider text-accent uppercase">
                틀린 표현 복습
              </p>
              <div className="mt-3 flex flex-col gap-3">
                {wrongItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-btn bg-accent-soft p-4 shadow-xs"
                  >
                    <div>
                      <p className="text-sm font-extrabold text-ink">
                        {item.expression}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        내 답: {item.userAnswer || "미입력"}
                      </p>
                    </div>
                    <span className="text-accent font-black text-base">✕</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => {
              startTransition(() => {
                router.push("/");
                router.refresh();
              });
            }}
            className="flex-1 h-13 rounded-btn bg-gradient-to-r from-primary to-primary-light text-sm font-extrabold text-white shadow-btn transition hover:shadow-btn-hover hover:-translate-y-0.5"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="mx-auto max-w-md p-8 text-center text-muted">
        로딩 중이거나 문제가 발생했습니다...
      </div>
    );
  }

  const loData = currentItem.learningObject;
  const expression = loData.expression;
  const meaningKo = loData.definition_ko || "의미 정보가 없습니다.";
  const meaningEn = loData.definition_en || "No definition provided.";
  
  // Normalize examples directly from Example type
  const examples: string[] = (loData.examples || []).map((ex) => {
    if (typeof ex === "string") return ex;
    return ex?.text ?? "";
  }).filter(Boolean);

  // Get quiz template safely matching QuizTemplate domain model
  // 1순위: fill_blank (빈칸 채우기), 2순위: retrieval, 3순위: 기본 템플릿
  const quizTemplate = currentItem.quizTemplates?.find((t) => t.activity_type === "fill_blank") ??
    currentItem.quizTemplates?.find((t) => t.activity_type === "retrieval") ??
    currentItem.quizTemplates?.[0];
    
  const isChoiceQuiz = quizTemplate ? quizTemplate.activity_type === "recognition" : false;
  const choices: string[] = quizTemplate?.choices && quizTemplate.choices.length > 0 ? quizTemplate.choices : [loData.expression, "pick up", "go off", "turn down"].sort(() => Math.random() - 0.5);
  const unitNum = loData.unit;

  // 퀴즈 프롬프트 결정 (fill_blank 템플릿의 prompt 우선, 없을 경우 첫 예문의 표현을 빈칸으로 치환)
  let quizPrompt = quizTemplate?.prompt ?? "";
  if (!quizPrompt || quizPrompt === meaningKo || quizPrompt.includes("사용하여 영어 문장을")) {
    if (examples.length > 0 && examples[0]) {
      const regex = new RegExp(loData.expression, "gi");
      quizPrompt = examples[0].replace(regex, "__________");
    } else {
      quizPrompt = `다음 의미를 가진 표현은 무엇일까요?`;
    }
  }

  const handleNextExposure = () => {
    setPhase("quiz");
    setCardFlipped(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleQuizSubmit = async () => {
    if (isSubmitting || feedback) return;

    const answer = isChoiceQuiz ? selectedAnswer : inputAnswer.trim();
    if (!answer) return;

    setIsSubmitting(true);

    try {
      // API 채점 시도 - 백엔드 스펙에 완벽하게 부합하도록 파라미터 구성
      const res = await fetch("/api/answer/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: `session_${Date.now()}`,
          learning_object_id: loData.learning_object_id,
          activity_type: quizTemplate?.activity_type ?? (isChoiceQuiz ? "recognition" : "retrieval"),
          answer: answer,
          response_latency_ms: 3000,
          hint_used: false,
          attempt_count: 1,
        }),
      });

      let isCorrect = false;
      let correctAnswer = loData.expression;

      // 유연한 정답 판단 헬퍼 함수 (괄호 완벽 제거 후 전체 일치 또는 Particle 일치)
      const checkCorrect = (userAns: string, fullExpr: string) => {
        const cleanAns = userAns.replace(/\(.*\)/g, "").trim().toLowerCase();
        const cleanExpr = fullExpr.replace(/\(.*\)/g, "").trim().toLowerCase();
        if (cleanAns === cleanExpr) return true;
        const parts = cleanExpr.split(" ");
        if (parts.length > 1) {
          const particleOnly = parts.slice(1).join(" ");
          if (cleanAns === particleOnly) return true;
          if (parts.length === 3 && cleanAns === parts[2]) return true;
        }
        return false;
      };

      if (res.ok) {
        const data = await res.json();
        isCorrect = data.is_correct;
        if (data.correct_answer) correctAnswer = data.correct_answer;
        // 클라이언트 차원에서 한번 더 괄호 및 Particle 매칭 보정
        if (!isCorrect && checkCorrect(answer, loData.expression)) {
          isCorrect = true;
        }
      } else {
        // Fallback 클라이언트 채점
        isCorrect = checkCorrect(answer, loData.expression);
      }

      setFeedback({
        isCorrect,
        message: isCorrect ? "🎉 정답입니다! 완벽해요." : `💡 아쉽습니다. 정답은 '${correctAnswer}' 입니다.`,
      });
      setResults((prev) => [...prev, { id: loData.learning_object_id, expression: loData.expression, isCorrect, userAnswer: answer }]);
    } catch {
      // Fallback 클라이언트 채점
      const cleanAns = answer.replace(/\(.*\)/g, "").trim().toLowerCase();
      const cleanExpr = loData.expression.replace(/\(.*\)/g, "").trim().toLowerCase();
      let isCorrect = cleanAns === cleanExpr;
      const parts = cleanExpr.split(" ");
      if (!isCorrect && parts.length > 1) {
        isCorrect = cleanAns === parts.slice(1).join(" ");
        if (!isCorrect && parts.length === 3) isCorrect = cleanAns === parts[2];
      }
      setFeedback({
        isCorrect,
        message: isCorrect ? "🎉 정답입니다! 완벽해요." : `💡 아쉽습니다. 정답은 '${loData.expression}' 입니다.`,
      });
      setResults((prev) => [...prev, { id: loData.learning_object_id, expression: loData.expression, isCorrect, userAnswer: answer }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuiz = () => {
    setFeedback(null);
    setSelectedAnswer("");
    setInputAnswer("");

    if (currentIndex + 1 >= totalQuestions) {
      setPhase("summary");
    } else {
      setCurrentIndex((prev) => prev + 1);
      setPhase("exposure");
    }
  };

  return (
    <div className="mx-auto max-w-xl px-5 py-8">
      {/* Progress header */}
      <div className="flex items-center gap-4 animate-fade-in">
        <button
          onClick={() => {
            startTransition(() => {
              router.push("/");
              router.refresh();
            });
          }}
          className="text-xs font-bold text-faint hover:text-primary transition"
        >
          ← 나가기
        </button>
        <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-extrabold text-muted">
          {currentStep} / {totalQuestions}
        </span>
      </div>

      {phase === "exposure" ? (
        <div className="mt-6 animate-fade-in">
          {/* Flip card container */}
          <div className="relative [perspective:1000px]">
            <div
              onClick={() => setCardFlipped(!cardFlipped)}
              className={`relative min-h-[360px] w-full cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] ${
                cardFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* Front side */}
              <div className="absolute inset-0 flex flex-col justify-between rounded-card border border-border bg-gradient-to-br from-white to-primary-soft/50 p-8 shadow-card [backface-visibility:hidden]">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary shadow-xs">
                    학습 카드
                  </span>
                  {unitNum ? (
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-muted shadow-xs">
                      Unit {unitNum}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                    {expression}
                  </h1>
                  <p className="mt-3 text-sm text-faint">
                    {loData.grammar_pattern || "phrasal verb"}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted animate-pulse-soft">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9"/><polyline points="3 3 3 7 7 7"/></svg>
                  탭하여 뜻과 예문 보기
                </div>
              </div>

              {/* Back side with Premium Natural TTS & StopPropagation */}
              <div className="absolute inset-0 flex flex-col rounded-card border border-primary/30 bg-gradient-to-br from-white to-primary-soft p-8 shadow-card [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-y-auto">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-2xl font-extrabold text-ink">{expression}</h2>
                  <span className="rounded-badge bg-surface px-2.5 py-1 text-[11px] font-bold text-muted">
                    {loData.separability === "inseparable" ? "분리 불가" : "분리 가능"}
                  </span>
                </div>
                <div className="mt-4 rounded-btn bg-primary-soft/80 p-4 shadow-xs">
                  <p className="text-base font-extrabold text-primary">{meaningKo}</p>
                  <p className="text-xs text-primary/70 mt-1">{meaningEn}</p>
                </div>
                <p className="mt-5 text-xs font-extrabold tracking-wider text-faint uppercase">
                  예문 · Examples
                </p>
                <div className="mt-3 flex flex-col gap-2.5">
                  {examples.slice(0, 2).map((ex, idx) => {
                    const isPlaying = playingIndex === idx;

                    return (
                      <div
                        key={idx}
                        className="border-l-3 border-primary-light bg-white px-4 py-3 shadow-xs rounded-r-btn flex flex-row items-center justify-between gap-3 transition hover:bg-surface/50"
                      >
                        <p className="text-sm font-medium text-ink flex-1 min-w-0 pr-2 leading-relaxed">
                          {ex}
                        </p>
                        <button
                          type="button"
                          title="원어민 음성 듣기"
                          onClick={(e) => {
                            e.stopPropagation(); // 스피커 클릭 시 카드 뒤집기 버블링 방지
                            speakExample(ex, idx);
                          }}
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-btn border transition active:scale-95 ${
                            isPlaying
                              ? "bg-primary text-white border-primary animate-pulse shadow-sm"
                              : "bg-white text-primary border-border hover:bg-primary hover:text-white hover:border-primary shadow-xs"
                          }`}
                        >
                          <span className="text-sm">{isPlaying ? "🔊" : "🔈"}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleNextExposure}
            className="mt-6 w-full h-13 rounded-btn bg-gradient-to-r from-primary to-primary-light text-sm font-extrabold text-white shadow-btn transition hover:shadow-btn-hover hover:-translate-y-0.5"
          >
            암기 완료 · 퀴즈로 검증하기
          </button>
        </div>
      ) : (
        <div className={`mt-6 rounded-card border-2 p-8 shadow-card transition-all duration-300 ${
          feedback ? feedback.isCorrect ? "bg-success-soft border-success/30" : "bg-accent-soft border-accent/30 animate-shake" : "bg-white border-border"
        }`}>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent shadow-xs">
              {isChoiceQuiz ? "객관식 퀴즈" : "문맥 빈칸 채우기"}
            </span>
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary shadow-xs">
              Recall Training
            </span>
          </div>
          <p className="mt-4 text-xs font-bold text-muted">
            다음 문장의 빈칸에 들어갈 알맞은 표현을 선택하거나 입력하세요:
          </p>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight text-ink sm:text-2xl leading-relaxed">
            {quizPrompt}
          </h2>
          <div className="mt-4 inline-flex items-center gap-2 rounded-btn bg-surface px-4 py-2.5 text-xs font-bold text-muted border border-border/60 shadow-xs">
            <span className="text-base">💡</span>
            <span>힌트: {meaningKo}</span>
          </div>

          {isChoiceQuiz ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {choices.map((choice) => {
                const isSelected = selectedAnswer === choice;
                let btnStyles = "border-border bg-white text-ink hover:border-primary/40 hover:bg-primary-soft/30";

                if (isSelected) {
                  btnStyles = "border-primary bg-primary-soft text-primary font-black shadow-sm";
                }

                return (
                  <button
                    key={choice}
                    onClick={() => {
                      if (!feedback && !isSubmitting) setSelectedAnswer(choice);
                    }}
                    disabled={!!feedback || isSubmitting}
                    className={`flex h-14 items-center justify-between rounded-btn border-2 px-5 text-left text-sm font-extrabold transition-all ${btnStyles}`}
                  >
                    <span>{choice}</span>
                    {isSelected && <span className="text-primary font-extrabold">✓</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-6">
              <input
                type="text"
                value={inputAnswer}
                onChange={(e) => {
                  if (!feedback && !isSubmitting) setInputAnswer(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleQuizSubmit();
                }}
                disabled={!!feedback || isSubmitting}
                placeholder="phrasal verb를 입력하세요"
                className="w-full h-14 rounded-input border-2 border-border bg-white px-5 text-base font-extrabold text-ink shadow-xs outline-none transition focus:border-primary"
              />
            </div>
          )}

          {!feedback ? (
            <button
              onClick={handleQuizSubmit}
              disabled={isSubmitting || (isChoiceQuiz && !selectedAnswer) || (!isChoiceQuiz && !inputAnswer.trim())}
              className="mt-6 w-full h-13 rounded-btn bg-gradient-to-r from-primary to-primary-light text-sm font-extrabold text-white shadow-btn transition hover:shadow-btn-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? "채점 중..." : "제출하기"}
            </button>
          ) : (
            <div className="mt-6 animate-mn-pop">
              <div className={`rounded-btn p-4 shadow-xs ${
                feedback.isCorrect ? "bg-success text-white" : "bg-accent text-white"
              }`}>
                <p className="text-sm font-extrabold">{feedback.message}</p>
                {!feedback.isCorrect && (
                  <p className="text-xs text-white/80 mt-1">정의: {meaningKo}</p>
                )}
              </div>
              <button
                onClick={handleNextQuiz}
                className="mt-4 w-full h-13 rounded-btn bg-ink text-sm font-extrabold text-white shadow-md transition hover:bg-ink-muted hover:-translate-y-0.5"
              >
                {currentIndex + 1 >= totalQuestions ? "결과 요약 보기" : "다음 문제로"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
