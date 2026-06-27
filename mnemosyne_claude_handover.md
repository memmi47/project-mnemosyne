# 🎨 Project Mnemosyne — 클로드(Claude) 디자인 피드백 및 코드 개선 Handover 패키지

## 📋 [SECTION 1] 클로드용 마스터 프롬프트 (System Instruction)

```text
너는 실리콘밸리 최고 수준의 UI/UX 디자이너이자, 아크릴/글래스모피즘(Glassmorphism) 및 마이크로 인터랙션을 자유자재로 다루는 프리미엄 웹 애플리케이션 프론트엔드 아키텍트야.

우리는 현재 'English Phrasal Verbs in Use Intermediate' 교재를 기반으로 하는 AI 기반 장기 기억 최적화 학습 플랫폼(Personal Learning OS) 'Project Mnemosyne'을 개발 중이야. 
우리의 핵심 철학은 "단순히 영어를 가르치는 앱이 아니라, AI를 통해 인간의 장기 기억을 최적화하는 학습 운영체제를 구축하는 것"이며, "인식(Recognition)보다 회상(Recall)을 우선시"해.

현재 적용된 디자인 시스템은 딥 퍼플(Deep Purple)과 웜 코랄(Warm Coral), 그리고 부드러운 그라데이션과 쉐도우를 활용한 따뜻하고 세련된 감성(Warm Learning Theme)이야.

아래 첨부된 소스 코드들은 Project Mnemosyne의 전체 프론트엔드 코드베이스(Tailwind 설정, 전역 CSS, 레이아웃, 메인 대시보드, 학습 세션 플로우, 탐색 페이지, 통계 페이지)야.
사용자가 첨부한 스크린샷들과 아래의 소스 코드를 면밀히 분석한 뒤, 이 앱을 "훨씬 더 프로페셔널하고, 사용자가 보자마자 감탄(WOW)할 수 있는 최정상급 프리미엄 퀄리티"로 업그레이드하기 위한 구체적인 UI/UX 개선안과 수정된 JSX/TSX/Tailwind 코드를 제안해줘.

[✨ 클로드에게 요청하는 구체적인 행동 지침 ✨]
1. 모호한 디자인 조언 대신, 즉시 프로젝트에 복사-붙여넣기하여 반영할 수 있는 구체적인 컴포넌트 레벨의 개선 코드(JSX/Tailwind CSS 클래스)를 제공해줄 것.
2. 카드 레이아웃의 타이포그래피 계층 구조, 여백(Spacing), 시각적 무게감, 그리고 마이크로 인터랙션(Hover/Focus/Active state)을 극대화할 것.
3. 특히 'components/session-flow.tsx'의 3단계 학습 플로우(학습 카드 -> 퀴즈 -> 요약)와 'app/page.tsx'의 AI 맞춤 학습 큐 디자인을 더욱 생동감 있고 몰입감 넘치게 개선해줄 것.
```

---

## 💻 [SECTION 2] 전체 프론트엔드 소스 코드 첨부

### 1. tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6c5ce7",
          dark: "#5849c4",
          light: "#8c7efa",
          soft: "#f3f1f9",
        },
        accent: {
          DEFAULT: "#fd7062",
          dark: "#e05345",
          soft: "#fff0ee",
        },
        success: {
          DEFAULT: "#00b894",
          dark: "#009678",
          soft: "#e6f8f5",
        },
        warning: {
          DEFAULT: "#fdcb6e",
          dark: "#e0ad4c",
          soft: "#fffaf0",
        },
        ink: {
          DEFAULT: "#2d3436",
          muted: "#636e72",
          faint: "#b2bec3",
        },
        surface: {
          DEFAULT: "#f8f9fa",
          elevated: "#ffffff",
          overlay: "rgba(255, 255, 255, 0.8)",
        },
        border: {
          DEFAULT: "#ebedf0",
          hover: "#dfe6e9",
        },
      },
      borderRadius: {
        card: "20px",
        btn: "14px",
        input: "12px",
        badge: "8px",
      },
      boxShadow: {
        card: "0 10px 30px -5px rgba(108, 92, 231, 0.08)",
        "card-hover": "0 20px 40px -10px rgba(108, 92, 231, 0.15)",
        btn: "0 6px 15px -3px rgba(108, 92, 231, 0.25)",
        "btn-hover": "0 10px 20px -5px rgba(108, 92, 231, 0.35)",
        nav: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        progressFill: {
          "0%": { strokeDashoffset: "264" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-8px)" },
          "40%, 80%": { transform: "translateX(8px)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "progress-fill": "progressFill 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shake: "shake 0.5s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
```

---

### 2. app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: #f8f9fa;
    color: #2d3436;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background-image: 
      radial-gradient(at 0% 0%, rgba(108, 92, 231, 0.05) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(253, 112, 98, 0.05) 0px, transparent 50%);
    background-attachment: fixed;
    min-height: 100vh;
  }
}

@layer utilities {
  .card-enter {
    opacity: 0;
    animation: fadeIn 0.6s ease-out forwards;
  }
}
```

---

### 3. app/layout.tsx
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mnemosyne — Phrasal Verbs",
  description: "Personal Learning OS for Phrasal Verbs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-surface-overlay px-6 backdrop-blur-md shadow-nav">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-primary text-base font-extrabold text-white shadow-btn">
              M
            </div>
            <span className="text-lg font-bold tracking-tight text-ink">
              Mnemosyne
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-btn px-3 py-2 text-sm font-bold text-ink-muted transition hover:bg-surface hover:text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              홈
            </Link>
            <Link
              href="/units"
              className="flex items-center gap-2 rounded-btn px-3 py-2 text-sm font-bold text-ink-muted transition hover:bg-surface hover:text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Units
            </Link>
            <Link
              href="/progress"
              className="flex items-center gap-2 rounded-btn px-3 py-2 text-sm font-bold text-ink-muted transition hover:bg-surface hover:text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 20 18 10 12 20 12 4 6 20 6 14"/></svg>
              진행
            </Link>
          </nav>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
```

---

### 4. app/page.tsx (홈 대시보드)
```tsx
import Link from "next/link";
import { getTodayMission } from "@/src/services/today-mission-service";
import { getProgressSummary } from "@/src/services/progress-service";
import { loadLearningObjects } from "@/src/data/static-loader/learning-object-loader";

export default async function HomePage() {
  const mission = await getTodayMission();
  const progress = await getProgressSummary();
  const dataset = await loadLearningObjects();

  const loMap = new Map(dataset.learning_objects.map((obj) => [obj.learning_object_id, obj]));

  const totalLearned = progress.memory_summary.tracked_objects;
  const totalAvailable = progress.total_learning_objects;
  const completionPercent = totalAvailable > 0 ? Math.round((totalLearned / totalAvailable) * 100) : 0;
  const todayTotal = mission.review_count + mission.contrast_count + mission.new_learning_count;

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {/* Welcome section */}
      <div className="animate-fade-in">
        <p className="text-sm font-semibold text-primary">오늘의 학습</p>
        <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
          Phrasal Verbs 마스터하기 ✨
        </h1>
        <p className="mt-2 text-sm text-muted">
          AI 학습 엔진이 분석한 오늘의 최적화된 미션입니다. 검증된 {totalAvailable}개의 핵심 표현 중 내 장기 기억 상태에 맞춘 맞춤 표현들을 만나보세요.
        </p>
      </div>

      {/* Stats cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="오늘 학습" value={`${todayTotal}개`} sublabel={mission.mission_summary} color="primary" delay={0} />
        <StatCard label="학습 진행률" value={`${completionPercent}%`} sublabel={`${totalLearned} / ${totalAvailable} 표현`} color="success" delay={1} />
        <StatCard label="기억 강도" value={`${Math.round(progress.memory_summary.average_memory_strength)}%`} sublabel={`위험 ${progress.memory_summary.high_forgetting_risk_objects}개`} color="accent" delay={2} />
      </div>

      {/* Start session CTA */}
      {todayTotal > 0 ? (
        <div className="mt-8 animate-slide-up">
          <div className="relative overflow-hidden rounded-card bg-gradient-to-r from-primary to-primary-light p-6 shadow-btn sm:p-8">
            <div className="relative z-10">
              <h2 className="text-xl font-extrabold text-white sm:text-2xl">{mission.mission_summary}</h2>
              <p className="mt-2 text-sm text-white/80">새로운 표현을 배우고, 기억 속 표현을 복습하세요.</p>
              <Link href="/session" className="mt-5 inline-flex h-12 items-center gap-2 rounded-btn bg-white px-8 text-sm font-bold text-primary shadow-btn transition hover:shadow-btn-hover hover:scale-[1.02] active:scale-[0.98]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                학습 시작하기
              </Link>
            </div>
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -right-4 h-32 w-32 rounded-full bg-white/5" />
          </div>
        </div>
      ) : null}

      {/* Mission queue */}
      {mission.recommendations.length > 0 ? (
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold text-ink">AI 맞춤 학습 큐 (Today&apos;s Queue)</h2>
              <p className="text-xs text-muted mt-0.5">내 장기 기억 전환을 위해 오늘 우선적으로 학습하고 복습해야 할 추천 표현 목록입니다.</p>
            </div>
            <span className="rounded-badge bg-surface px-3 py-1 text-xs font-semibold text-muted self-start sm:self-auto">
              {mission.recommendations.length}개 표현 대기 중
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {mission.recommendations.slice(0, 8).map((rec, index) => {
              const lo = loMap.get(rec.learning_object_id) ?? dataset.learning_objects[index % dataset.learning_objects.length];
              const expression = lo ? lo.expression : rec.learning_object_id;
              const meaning = lo ? lo.definition_ko : "";
              const unitNum = lo ? (lo as unknown as { unit?: number }).unit : null;

              return (
                <div key={rec.recommendation_id} className="card-enter flex items-center gap-4 rounded-card border border-border bg-white p-4 shadow-card transition hover:shadow-card-hover hover:border-primary/30" style={{ animationDelay: `${index * 60}ms` }}>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">{index + 1}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-bold text-ink">{expression}</p>
                      {unitNum ? <span className="rounded-badge bg-surface px-2 py-0.5 text-[10px] font-semibold text-muted">Unit {unitNum}</span> : null}
                    </div>
                    {meaning ? <p className="truncate text-xs text-muted mt-0.5">{meaning}</p> : null}
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium text-faint">
                      <span>{getActivityLabel(rec.activity_type)}</span><span>·</span><span>우선도 {Math.round(rec.priority_score)}</span>
                    </div>
                  </div>
                  <PriorityBadge score={rec.priority_score} />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, sublabel, color, delay }: { label: string; value: string; sublabel: string; color: "primary" | "success" | "accent"; delay: number }) {
  const bgMap = { primary: "bg-primary-soft", success: "bg-success-soft", accent: "bg-accent-soft" };
  const textMap = { primary: "text-primary", success: "text-success", accent: "text-accent" };
  return (
    <div className="card-enter rounded-card border border-border bg-white p-5 shadow-card transition hover:shadow-card-hover" style={{ animationDelay: `${delay * 80}ms` }}>
      <div className="flex items-center gap-3">
        <div className={`h-2.5 w-2.5 rounded-full ${bgMap[color]}`}>
          <div className={`h-2.5 w-2.5 rounded-full ${textMap[color]} bg-current animate-pulse-soft`} />
        </div>
        <p className="text-xs font-semibold text-muted">{label}</p>
      </div>
      <p className={`mt-3 text-2xl font-extrabold ${textMap[color]}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{sublabel}</p>
    </div>
  );
}

function PriorityBadge({ score }: { score: number }) {
  const level = score >= 70 ? "high" : score >= 40 ? "mid" : "low";
  const styles = { high: "bg-accent-soft text-accent", mid: "bg-warning-soft text-warning-dark", low: "bg-success-soft text-success" };
  return (
    <span className={`rounded-badge px-2.5 py-1 text-xs font-bold ${styles[level]}`}>{Math.round(score)}</span>
  );
}

function getActivityLabel(activityType: string): string {
  const labels: Record<string, string> = {
    review: "🔄 복습", new_learning: "✨ 신규 학습", contrast: "⚖️ 비교 학습", recognition: "인식", retrieval: "회상", fill_blank: "빈칸", context_choice: "문맥", sentence_production: "작문", conversation_turn: "대화",
  };
  return labels[activityType] ?? activityType;
}
```

---

### 5. components/session-flow.tsx (학습 세션 플로우)
```tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { Recommendation, QuizTemplate } from "@/src/domain/models";

interface SessionLearningObject {
  learning_object_id: string;
  expression: string;
  definition_en: string;
  definition_ko: string;
  grammar_pattern: string;
  examples: Array<{ text: string; type: string }>;
  base_verb: string;
  particles: string[];
  separability: string;
}

interface SessionItem {
  recommendation: Recommendation;
  learningObject: SessionLearningObject;
  quizTemplates: QuizTemplate[];
}

interface SessionFlowProps {
  items: SessionItem[];
}

type SessionPhase = "exposure" | "quiz" | "summary";

interface QuizResult {
  learningObjectId: string;
  expression: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
}

export function SessionFlow({ items }: SessionFlowProps) {
  const [phase, setPhase] = useState<SessionPhase>("exposure");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [quizItemIndex, setQuizItemIndex] = useState(0);

  const currentItem = items[currentIndex] ?? null;
  const totalItems = items.length;

  // --- EXPOSURE PHASE ---
  if (phase === "exposure") {
    if (!currentItem) {
      setPhase("quiz");
      return null;
    }

    const lo = currentItem.learningObject;
    const progress = ((currentIndex + 1) / totalItems) * 100;

    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
            <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-semibold text-muted">{currentIndex + 1} / {totalItems}</span>
        </div>

        <div className="mt-6 rounded-card border border-border bg-white p-6 shadow-card animate-slide-up sm:p-8">
          <div className="flex items-center gap-2">
            <span className="rounded-badge bg-primary-soft px-3 py-1 text-xs font-bold text-primary">학습 카드</span>
            <span className="rounded-badge bg-surface px-3 py-1 text-xs font-semibold text-muted">Unit {getUnit(currentItem)}</span>
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-ink sm:text-4xl">{lo.expression}</h1>

          <div className="mt-4 rounded-btn bg-primary-soft p-4">
            <p className="text-base font-bold text-primary">{lo.definition_ko}</p>
            <p className="mt-1 text-sm text-primary/70">{lo.definition_en}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {lo.grammar_pattern ? <span className="rounded-badge bg-surface px-3 py-1.5 text-xs font-medium text-muted">📝 {lo.grammar_pattern}</span> : null}
            {lo.separability && lo.separability !== "unknown" ? (
              <span className="rounded-badge bg-surface px-3 py-1.5 text-xs font-medium text-muted">
                {lo.separability === "separable" ? "✂️ 분리 가능" : "🔗 분리 불가"}
              </span>
            ) : null}
          </div>

          {lo.examples.length > 0 ? (
            <div className="mt-6">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">예문</p>
              <div className="mt-3 space-y-3">
                {lo.examples.map((ex, i) => (
                  <div key={i} className="rounded-btn bg-surface p-4">
                    <p className="text-sm font-medium text-ink leading-relaxed">{highlightExpression(ex.text, lo.expression)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex gap-3">
          {currentIndex > 0 ? (
            <button onClick={() => setCurrentIndex((i) => i - 1)} className="flex-1 h-12 rounded-btn border border-border bg-white text-sm font-bold text-muted transition hover:bg-surface">
              ← 이전
            </button>
          ) : null}
          <button onClick={() => { if (currentIndex < totalItems - 1) { setCurrentIndex((i) => i + 1); } else { setPhase("quiz"); setQuizItemIndex(0); } }} className="flex-1 h-12 rounded-btn bg-primary text-sm font-bold text-white shadow-btn transition hover:shadow-btn-hover hover:bg-primary-dark active:scale-[0.98]">
            {currentIndex < totalItems - 1 ? "다음 표현 →" : "연습 시작 🎯"}
          </button>
        </div>
      </div>
    );
  }

  // --- QUIZ PHASE ---
  if (phase === "quiz") {
    const quizItem = items[quizItemIndex];
    if (!quizItem) { setPhase("summary"); return null; }
    const activityType = quizItem.recommendation.activity_type;
    const preferredType = activityType === "new_learning" ? "recognition" : "retrieval";
    const template = quizItem.quizTemplates.find((t) => t.activity_type === preferredType) ?? quizItem.quizTemplates[0] ?? null;
    const progress = ((quizItemIndex + 1) / totalItems) * 100;

    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
            <div className="h-2 rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-semibold text-muted">문제 {quizItemIndex + 1} / {totalItems}</span>
        </div>

        <QuizCard
          key={quizItem.learningObject.learning_object_id}
          item={quizItem}
          template={template}
          onAnswer={(result) => {
            setQuizResults((prev) => [...prev, result]);
            setTimeout(() => { if (quizItemIndex < totalItems - 1) { setQuizItemIndex((i) => i + 1); } else { setPhase("summary"); } }, 1500);
          }}
        />
      </div>
    );
  }

  // --- SUMMARY PHASE ---
  const correctCount = quizResults.filter((r) => r.isCorrect).length;
  const wrongResults = quizResults.filter((r) => !r.isCorrect);
  const accuracy = quizResults.length > 0 ? Math.round((correctCount / quizResults.length) * 100) : 0;

  return (
    <div className="animate-slide-up">
      <div className="rounded-card border border-border bg-white p-6 shadow-card text-center sm:p-8">
        <div className="text-5xl">{accuracy >= 80 ? "🎉" : accuracy >= 50 ? "💪" : "📚"}</div>
        <h1 className="mt-4 text-2xl font-extrabold text-ink">세션 완료!</h1>
        <p className="mt-2 text-muted">{quizResults.length}문제 중 {correctCount}문제 정답</p>

        <div className="mt-6 flex justify-center">
          <div className="relative h-28 w-28">
            <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f1f9" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={accuracy >= 80 ? "#00b894" : accuracy >= 50 ? "#6c5ce7" : "#fd7062"} strokeWidth="8" strokeDasharray={`${accuracy * 2.64} 264`} strokeLinecap="round" className="animate-progress-fill" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-extrabold text-ink">{accuracy}%</span>
            </div>
          </div>
        </div>

        {wrongResults.length > 0 ? (
          <div className="mt-8 text-left">
            <p className="text-sm font-bold text-accent">틀린 표현 복습</p>
            <div className="mt-3 space-y-2">
              {wrongResults.map((r, i) => (
                <div key={i} className="rounded-btn bg-accent-soft p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-ink">{r.expression}</p>
                    <p className="text-xs text-muted mt-0.5">내 답: {r.userAnswer || "(미입력)"}</p>
                  </div>
                  <span className="text-xs font-bold text-accent">✕</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/session" className="flex-1 h-12 flex items-center justify-center rounded-btn bg-primary text-sm font-bold text-white shadow-btn transition hover:shadow-btn-hover">다시 학습하기</Link>
        <Link href="/" className="flex-1 h-12 flex items-center justify-center rounded-btn border border-border bg-white text-sm font-bold text-muted transition hover:bg-surface">홈으로</Link>
      </div>
    </div>
  );
}

function QuizCard({ item, template, onAnswer }: { item: SessionItem; template: QuizTemplate | null; onAnswer: (result: QuizResult) => void; }) {
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lo = item.learningObject;
  const isMultipleChoice = template && template.choices.length > 0;
  const prompt = template?.prompt ?? lo.definition_ko;
  const instruction = template?.instruction_ko ?? "다음 뜻에 해당하는 phrasal verb를 입력하세요.";

  async function handleSubmit() {
    if (!userAnswer.trim() || isSubmitting || submitted) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/answer/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: `session_${Date.now()}`, learning_object_id: lo.learning_object_id, activity_type: template?.activity_type ?? "retrieval", answer: userAnswer, response_latency_ms: 5000, hint_used: false, attempt_count: 1 }),
      });
      const data = await response.json();
      const correct = "is_correct" in data ? data.is_correct : false;
      setIsCorrect(correct); setSubmitted(true);
      onAnswer({ learningObjectId: lo.learning_object_id, expression: lo.expression, isCorrect: correct, userAnswer: userAnswer, correctAnswer: lo.expression });
    } catch {
      setSubmitted(true); setIsCorrect(false);
      onAnswer({ learningObjectId: lo.learning_object_id, expression: lo.expression, isCorrect: false, userAnswer: userAnswer, correctAnswer: lo.expression });
    } finally { setIsSubmitting(false); }
  }

  return (
    <div className={`mt-6 rounded-card border-2 bg-white p-6 shadow-card transition-all duration-300 sm:p-8 ${submitted ? isCorrect ? "border-success bg-success-soft" : "border-accent bg-accent-soft animate-shake" : "border-border"}`}>
      <span className="rounded-badge bg-accent-soft px-3 py-1 text-xs font-bold text-accent">{template ? getQuizTypeLabel(template.activity_type) : "회상"}</span>
      <p className="mt-4 text-sm font-semibold text-muted">{instruction}</p>
      <h2 className="mt-2 text-xl font-extrabold text-ink sm:text-2xl">{prompt}</h2>

      {isMultipleChoice ? (
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {template.choices.map((choice) => {
            const isSelected = userAnswer === choice; const showResult = submitted; const isAnswer = choice === lo.expression;
            let style = "border-border bg-white text-ink hover:bg-surface hover:border-primary/30";
            if (isSelected && !showResult) style = "border-primary bg-primary-soft text-primary";
            if (showResult && isAnswer) style = "border-success bg-success-soft text-success-dark";
            if (showResult && isSelected && !isAnswer) style = "border-accent bg-accent-soft text-accent";
            return (
              <button key={choice} disabled={submitted} onClick={() => setUserAnswer(choice)} className={`h-14 rounded-btn border-2 px-4 text-left text-sm font-bold transition ${style}`}>
                {choice}{showResult && isAnswer ? " ✓" : ""}{showResult && isSelected && !isAnswer ? " ✕" : ""}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-6">
          <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void handleSubmit(); }} disabled={submitted} placeholder="phrasal verb를 입력하세요" className="w-full h-14 rounded-input border-2 border-border bg-surface px-4 text-lg font-bold text-ink outline-none transition placeholder:text-faint focus:border-primary focus:bg-white disabled:opacity-60" autoFocus />
        </div>
      )}

      {!submitted ? <button onClick={() => void handleSubmit()} disabled={!userAnswer.trim() || isSubmitting} className="mt-4 h-12 w-full rounded-btn bg-primary text-sm font-bold text-white shadow-btn transition hover:shadow-btn-hover hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">{isSubmitting ? "채점 중..." : "제출"}</button> : null}

      {submitted ? (
        <div className={`mt-4 rounded-btn p-4 animate-scale-in ${isCorrect ? "bg-success/10" : "bg-accent/10"}`}>
          <p className="text-sm font-bold">{isCorrect ? "🎉 정답입니다!" : `😅 정답: ${lo.expression}`}</p>
          {!isCorrect ? <p className="mt-1 text-xs text-muted">{lo.definition_ko}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function highlightExpression(text: string, expression: string): React.ReactNode {
  const parts = text.split(new RegExp(`(${escapeRegExp(expression)})`, "gi"));
  return parts.map((part, i) => part.toLowerCase() === expression.toLowerCase() ? <strong key={i} className="text-primary font-extrabold">{part}</strong> : <span key={i}>{part}</span>);
}
function escapeRegExp(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function getUnit(item: SessionItem): number { return (item.learningObject as unknown as { unit?: number }).unit ?? 0; }
function getQuizTypeLabel(type: string): string {
  const labels: Record<string, string> = { recognition: "4지선다", retrieval: "직접 입력", fill_blank: "빈칸 채우기", context_choice: "문맥 선택", sentence_production: "문장 작성", conversation_turn: "대화" };
  return labels[type] ?? type;
}
```

---

### 6. app/units/page.tsx (Units 탐색 페이지)
```tsx
import Link from "next/link";
import { loadLearningObjects } from "@/src/data/static-loader/learning-object-loader";

interface UnitInfo {
  unit: number; title: string; expressionCount: number; expressions: string[];
}

export default async function UnitsPage() {
  const dataset = await loadLearningObjects();
  const unitMap = new Map<number, UnitInfo>();

  for (const obj of dataset.learning_objects) {
    const unitNum = (obj as unknown as { unit?: number }).unit;
    if (!unitNum) continue;
    const existing = unitMap.get(unitNum);
    if (existing) {
      existing.expressionCount++;
      if (!existing.expressions.includes(obj.expression)) existing.expressions.push(obj.expression);
    } else {
      unitMap.set(unitNum, { unit: unitNum, title: (obj as unknown as { unit_title?: string }).unit_title ?? `Unit ${unitNum}`, expressionCount: 1, expressions: [obj.expression] });
    }
  }
  const units = Array.from(unitMap.values()).sort((a, b) => a.unit - b.unit);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="animate-fade-in">
        <p className="text-sm font-semibold text-primary">교재 탐색</p>
        <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">Units 📖</h1>
        <p className="mt-2 text-sm text-muted">English Phrasal Verbs in Use Intermediate — 유닛별로 표현을 탐색하세요.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {units.map((unit, index) => (
          <div key={unit.unit} className="card-enter group rounded-card border border-border bg-white p-5 shadow-card transition hover:shadow-card-hover hover:border-primary/30" style={{ animationDelay: `${index * 60}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">{unit.unit}</div>
              <span className="rounded-badge bg-surface px-2.5 py-1 text-xs font-semibold text-muted">{unit.expressions.length}개 표현</span>
            </div>
            <h3 className="mt-4 text-base font-bold text-ink group-hover:text-primary transition">{unit.title}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {unit.expressions.slice(0, 5).map((expr) => (<span key={expr} className="rounded-badge bg-surface px-2 py-0.5 text-xs font-medium text-muted">{expr}</span>))}
              {unit.expressions.length > 5 ? (<span className="rounded-badge bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">+{unit.expressions.length - 5}</span>) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 7. app/progress/page.tsx (진행 상태 대시보드)
```tsx
import { getProgressSummary } from "@/src/services/progress-service";
import Link from "next/link";

export default async function ProgressPage() {
  const progress = await getProgressSummary();
  const total = progress.total_learning_objects;
  const usable = progress.usable_learning_objects;
  const tracked = progress.memory_summary.tracked_objects;
  const avgStrength = Math.round(progress.memory_summary.average_memory_strength);
  const highRisk = progress.memory_summary.high_forgetting_risk_objects;

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="animate-fade-in">
        <p className="text-sm font-semibold text-primary">학습 현황</p>
        <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">Progress 📊</h1>
        <p className="mt-2 text-sm text-muted">전체 학습 진행 상황과 기억 상태를 확인하세요.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProgressCard icon="📖" label="전체 표현" value={total} sublabel="데이터셋" color="primary" delay={0} />
        <ProgressCard icon="✅" label="학습 가능" value={usable} sublabel="검증 완료" color="success" delay={1} />
        <ProgressCard icon="🧠" label="추적 중" value={tracked} sublabel="Memory Object" color="primary" delay={2} />
        <ProgressCard icon="⚠️" label="망각 위험" value={highRisk} sublabel="복습 필요" color="accent" delay={3} />
      </div>

      <div className="mt-8 rounded-card border border-border bg-white p-6 shadow-card animate-slide-up">
        <h2 className="text-lg font-bold text-ink">평균 기억 강도</h2>
        <div className="mt-4 flex items-center gap-6">
          <div className="relative h-24 w-24 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f1f9" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={avgStrength >= 60 ? "#00b894" : avgStrength >= 30 ? "#fdcb6e" : "#fd7062"} strokeWidth="8" strokeDasharray={`${avgStrength * 2.64} 264`} strokeLinecap="round" className="animate-progress-fill" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-extrabold text-ink">{avgStrength}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted">
              {avgStrength >= 60 ? "좋은 상태입니다! 꾸준히 복습을 이어가세요." : avgStrength >= 30 ? "기억이 약해지고 있습니다. 복습을 시작하세요." : "기억 강도가 낮습니다. 지금 바로 복습하세요!"}
            </p>
            <Link href="/session" className="mt-3 inline-flex h-10 items-center rounded-btn bg-primary px-5 text-sm font-bold text-white shadow-btn transition hover:shadow-btn-hover">학습 시작</Link>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-card border border-border bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold text-ink">데이터셋 현황</h2>
        <div className="mt-4 space-y-3">
          <StatBar label="학습 가능 표현" value={usable} max={total} color="bg-success" />
          <StatBar label="검수 대기" value={progress.review_required_objects} max={total} color="bg-warning" />
          <StatBar label="기억 추적 중" value={tracked} max={usable || 1} color="bg-primary" />
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ icon, label, value, sublabel, color, delay }: { icon: string; label: string; value: number; sublabel: string; color: "primary" | "success" | "accent"; delay: number }) {
  const textMap = { primary: "text-primary", success: "text-success", accent: "text-accent" };
  return (
    <div className="card-enter rounded-card border border-border bg-white p-5 shadow-card" style={{ animationDelay: `${delay * 80}ms` }}>
      <div className="text-2xl">{icon}</div>
      <p className="mt-3 text-xs font-semibold text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${textMap[color]}`}>{value}</p>
      <p className="mt-0.5 text-xs text-faint">{sublabel}</p>
    </div>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm"><span className="font-medium text-ink">{label}</span><span className="font-bold text-muted">{value} / {max}</span></div>
      <div className="mt-1.5 h-2.5 rounded-full bg-surface overflow-hidden"><div className={`h-2.5 rounded-full ${color} animate-progress-fill`} style={{ width: `${percent}%` }} /></div>
    </div>
  );
}
```
