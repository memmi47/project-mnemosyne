"use client";

import type { LearningObject } from "@/src/domain/models";
import { useState, useEffect } from "react";
import { getKnownAndStarredIds, toggleKnown, toggleStarred } from "@/src/services/local-memory-service";

interface LearningObjectDetailProps {
  learningObject: LearningObject;
}

export function LearningObjectDetail({ learningObject }: LearningObjectDetailProps) {
  const examples = learningObject.examples ?? [];
  const unitNum = (learningObject as unknown as { unit?: number }).unit;
  const unitTitle = (learningObject as unknown as { unit_title?: string }).unit_title;

  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [speechVoices, setSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Known & Starred State
  const [isKnown, setIsKnown] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Known / Starred 상태 로드
    const { knownIds, starredIds } = getKnownAndStarredIds();
    setIsKnown(knownIds.includes(learningObject.learning_object_id));
    setIsStarred(starredIds.includes(learningObject.learning_object_id));

    if (!("speechSynthesis" in window)) return;
    const updateVoices = () => {
      setSpeechVoices(window.speechSynthesis.getVoices());
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [learningObject.learning_object_id]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleKnownToggle = () => {
    const newState = toggleKnown(learningObject.learning_object_id, learningObject.expression);
    setIsKnown(newState);
    if (newState) {
      triggerToast("👏 졸업 완료! 다음부터 퀴즈 및 복습에 나오지 않습니다.");
    } else {
      triggerToast("🔄 졸업 해제. 다시 복습 큐에 포함됩니다.");
    }
  };

  const handleStarredToggle = () => {
    const newState = toggleStarred(learningObject.learning_object_id, learningObject.expression);
    setIsStarred(newState);
    if (newState) {
      triggerToast("⭐ 별표 단어장에 추가되었습니다.");
    } else {
      triggerToast("⭐ 별표 단어장에서 제거되었습니다.");
    }
  };

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

  return (
    <article className="flex flex-col gap-6 relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-ink text-white px-5 py-3 rounded-full text-xs font-extrabold shadow-toast animate-mn-pop whitespace-nowrap">
          {toastMsg}
        </div>
      )}

      {/* Premium Hero Banner for the Expression (TTS Not included here as requested) */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-primary-dark via-primary to-primary-light p-6 sm:p-10 shadow-hero text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold tracking-wider backdrop-blur-md shadow-xs">
                {unitNum ? `Unit ${unitNum}` : "AI Focus Expression"}
              </span>
              {unitTitle ? (
                <span className="text-xs font-semibold text-white/90 truncate">
                  {unitTitle}
                </span>
              ) : null}
            </div>

            {/* 작고 잘 보이는 이모티콘 전용 토글 버튼 (말 없음) */}
            <div className="flex items-center gap-1.5 z-20">
              <button
                type="button"
                onClick={handleKnownToggle}
                title={isKnown ? "아는 단어 졸업됨" : "아는 단어 표시"}
                className={`flex h-9 w-9 items-center justify-center rounded-btn bg-white/10 backdrop-blur-md border border-white/30 transition-all duration-200 active:scale-90 ${
                  isKnown ? "bg-success/90 border-success shadow-sm" : "hover:bg-white/20"
                }`}
              >
                <span className={`text-base transition-all duration-300 ${isKnown ? "opacity-100 scale-125 drop-shadow-[0_2px_8px_rgba(0,184,148,0.9)] animate-mn-pop" : "opacity-40 grayscale hover:opacity-80"}`}>
                  💡
                </span>
              </button>
              <button
                type="button"
                onClick={handleStarredToggle}
                title={isStarred ? "별표됨" : "별표 치기"}
                className={`flex h-9 w-9 items-center justify-center rounded-btn bg-white/10 backdrop-blur-md border border-white/30 transition-all duration-200 active:scale-90 ${
                  isStarred ? "bg-accent/90 border-accent shadow-sm" : "hover:bg-white/20"
                }`}
              >
                <span className={`text-lg transition-all duration-300 ${isStarred ? "opacity-100 scale-130 drop-shadow-[0_2px_10px_rgba(255,215,0,0.9)] animate-mn-pop" : "opacity-40 grayscale hover:opacity-80"}`}>
                  {isStarred ? "🌟" : "⭐"}
                </span>
              </button>
            </div>
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
            {learningObject.expression}
          </h1>

          <p className="mt-3 text-base sm:text-xl font-medium text-white/95 leading-relaxed backdrop-blur-xs py-1">
            {learningObject.definition_ko || learningObject.definition_en || "의미 검수가 완료되었습니다."}
          </p>

          {learningObject.definition_ko && learningObject.definition_en ? (
            <p className="mt-2 text-xs sm:text-sm text-white/80 italic">
              {learningObject.definition_en}
            </p>
          ) : null}
        </div>

        {/* Floating background sheen & glow effects */}
        <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-mn-sheen pointer-events-none" />
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 pointer-events-none blur-md" />
        <div className="absolute -bottom-16 right-20 h-40 w-40 rounded-full bg-white/5 pointer-events-none blur-sm" />
      </div>

      {/* Examples & Use Cases Section with Premium Natural TTS */}
      <div className="rounded-[24px] border border-border bg-white p-6 sm:p-8 shadow-card">
        <h2 className="text-lg sm:text-xl font-extrabold text-ink flex items-center gap-2">
          <span className="text-xl">💡</span> 실전 활용 예문 <span className="text-xs sm:text-sm font-bold text-faint ml-1">In Context</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted mt-1">
          실제 원어민들이 일상 대화 및 문맥 속에서 이 구동사를 어떻게 활용하는지 입체적으로 익혀보세요. 스피커 아이콘을 누르면 자연스러운 원어민 음성으로 읽어줍니다.
        </p>

        <div className="mt-6 space-y-4">
          {examples.length > 0 ? (
            examples.map((ex, index) => {
              let enText = "";
              let koText = "";

              if (typeof ex === "string") {
                enText = ex;
              } else if (ex && typeof ex === "object") {
                const exObj = ex as unknown as Record<string, unknown>;
                enText = (exObj.text as string) || (exObj.sentence_en as string) || (exObj.en as string) || "";
                koText = (exObj.translation as string) || (exObj.sentence_ko as string) || (exObj.ko as string) || "";
              }

              if (!enText) return null;
              const isPlaying = playingIndex === index;

              return (
                <div
                  key={index}
                  className="card-enter rounded-[20px] bg-surface p-4 sm:p-5 border border-border/60 shadow-xs transition hover:bg-primary-soft/30 hover:border-primary/30 flex flex-row items-center justify-between gap-3"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm sm:text-base font-bold text-ink leading-relaxed">
                      {enText}
                    </p>
                    {koText ? (
                      <p className="mt-2 text-xs sm:text-sm font-medium text-muted border-t border-border/60 pt-2">
                        {koText}
                      </p>
                    ) : null}
                  </div>

                  <button
                    onClick={() => speakExample(enText, index)}
                    type="button"
                    title="원어민 음성 듣기"
                    className={`flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-btn border transition-all duration-200 active:scale-95 ${
                      isPlaying
                        ? "bg-primary text-white border-primary animate-pulse shadow-btn"
                        : "bg-white text-primary border-border hover:bg-primary hover:text-white hover:border-primary shadow-xs"
                    }`}
                  >
                    <span className="text-lg sm:text-xl">{isPlaying ? "🔊" : "🔈"}</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="rounded-[20px] bg-surface p-5 text-center text-sm text-muted font-medium">
              기본 제공 예문이 로드 중이거나 학습 퀴즈 템플릿을 통해 동적 제공됩니다.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
