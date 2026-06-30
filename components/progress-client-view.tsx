"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { PwaNavLink } from "./pwa-nav-link";
import { getLocalProgressSummary, exportLearningData, importLearningData, clearLearningData, getKnownAndStarredIds, type LocalMemoryRecord } from "@/src/services/local-memory-service";

interface ProgressProps {
  initialTotal: number;
  initialUsable: number;
  initialReviewRequired: number;
}

export function ProgressClientView({ initialTotal, initialUsable, initialReviewRequired }: ProgressProps) {
  const [isClient, setIsClient] = useState(false);
  const [tracked, setTracked] = useState(0);
  const [avgStrength, setAvgStrength] = useState(0);
  const [highRisk, setHighRisk] = useState(0);
  const [records, setRecords] = useState<LocalMemoryRecord[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // 학습 가능 표현 및 졸업 단어 상태 신설
  const [usableCount, setUsableCount] = useState(initialUsable);
  const [knownCount, setKnownCount] = useState(0);

  const refreshLocalData = () => {
    const summary = getLocalProgressSummary();
    setTracked(summary.tracked_objects);
    setAvgStrength(summary.average_memory_strength);
    setHighRisk(summary.high_forgetting_risk_objects);
    setRecords(summary.records);

    // 아는 단어 졸업 개수를 실시간으로 로드하여 학습 가능 표현 수 차감 계산
    const { knownIds } = getKnownAndStarredIds();
    setKnownCount(knownIds.length);
    setUsableCount(Math.max(0, initialUsable - knownIds.length));
  };

  useEffect(() => {
    setIsClient(true);
    refreshLocalData();
  }, []);

  const handleExport = () => {
    const jsonStr = exportLearningData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mnemosyne_progress_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage("🎉 학습 데이터가 성공적으로 다운로드되었습니다!");
    setTimeout(() => setMessage(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importLearningData(content);
      if (res.success) {
        refreshLocalData();
        setMessage(`✨ 성공적으로 ${res.count}개의 학습 기록을 복원했습니다!`);
      } else {
        setMessage(`❌ 가져오기 실패: ${res.error}`);
      }
      setTimeout(() => setMessage(null), 4000);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm("정말로 모든 로컬 학습 기록을 초기화하시겠습니까?")) {
      clearLearningData();
      refreshLocalData();
      setMessage("🗑️ 학습 기록이 초기화되었습니다.");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-5 sm:py-8">
      {message && (
        <div className="mb-6 rounded-card bg-primary-light/10 border border-primary p-4 text-center text-sm font-bold text-primary shadow-sm animate-fade-in">
          {message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <p className="text-xs sm:text-sm font-semibold text-primary">로컬 영속화 학습 현황</p>
          <h1 className="mt-1 sm:mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            Progress 📊
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted">
            브라우저 내 학습 기록을 확인하고, 언제든 기기 간 데이터 다운로드/복원을 진행하세요.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="inline-flex h-10 items-center rounded-btn bg-gradient-to-r from-primary to-primary-light px-4 text-xs sm:text-sm font-bold text-white shadow-btn transition hover:shadow-btn-hover hover:-translate-y-0.5"
          >
            📥 백업 다운로드
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-10 items-center rounded-btn bg-surface border border-border px-4 text-xs sm:text-sm font-bold text-ink transition hover:bg-surface-hover hover:-translate-y-0.5"
          >
            📤 백업 업로드
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          {tracked > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex h-10 items-center rounded-btn bg-red-50 hover:bg-red-100 text-red-600 px-3 text-xs sm:text-sm font-bold transition"
              title="학습 기록 초기화"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* Overview cards - 홈 화면과 100% 동일하게 한 줄에 3개 카드로 간결하게 통합 배치 */}
      <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4 w-full box-border">
        <ProgressCard icon="✅" label="학습 가능" value={isClient ? usableCount : initialUsable} sublabel={isClient && knownCount > 0 ? `졸업 ${knownCount}개 제외` : `전체 ${initialTotal}개`} color="success" delay={0} />
        <ProgressCard icon="🧠" label="추적 중" value={isClient ? tracked : 0} sublabel="저장된 표현" color="primary" delay={1} />
        <ProgressCard icon="⚠️" label="망각 위험" value={isClient ? highRisk : 0} sublabel="복습 필요" color="accent" delay={2} />
      </div>

      {/* Memory Strength */}
      <div className="mt-6 sm:mt-8 rounded-[20px] sm:rounded-card border border-border bg-white p-5 sm:p-6 shadow-card animate-slide-up">
        <h2 className="text-base sm:text-lg font-bold text-ink">평균 기억 강도</h2>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 self-center sm:self-auto">
            <svg viewBox="0 0 100 100" className="h-20 w-20 sm:h-24 sm:w-24 -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f1f9" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={avgStrength >= 60 ? "#00b894" : avgStrength >= 30 ? "#fdcb6e" : "#fd7062"}
                strokeWidth="8"
                strokeDasharray={`${avgStrength * 2.64} 264`}
                strokeLinecap="round"
                className="animate-progress-fill"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg sm:text-xl font-extrabold text-ink">{isClient ? avgStrength : 0}%</span>
            </div>
          </div>
          <div className="text-center sm:text-left flex-1">
            <p className="text-xs sm:text-sm text-muted">
              {avgStrength >= 60
                ? "좋은 상태입니다! 꾸준히 복습을 이어가세요."
                : avgStrength >= 30
                ? "기억이 약해지고 있습니다. 복습을 시작하세요."
                : "기억 강도가 낮습니다. 지금 바로 학습/복습을 시작하세요!"}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
              <PwaNavLink
                href="/session?mode=review"
                className="inline-flex h-11 items-center rounded-btn bg-primary px-6 text-xs sm:text-sm font-bold text-white shadow-btn transition hover:shadow-btn-hover hover:-translate-y-0.5"
              >
                🚀 즉시 집중 복습 시작
              </PwaNavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mt-5 sm:mt-6 rounded-[20px] sm:rounded-card border border-border bg-white p-5 sm:p-6 shadow-card">
        <h2 className="text-base sm:text-lg font-bold text-ink">데이터셋 및 로컬 현황</h2>
        <div className="mt-4 space-y-3">
          <StatBar label="잔여 학습 가능 표현" value={isClient ? usableCount : initialUsable} max={initialTotal} color="bg-success" />
          <StatBar label="💡 아는 단어 (졸업 완료)" value={isClient ? knownCount : 0} max={initialTotal} color="bg-primary" />
          <StatBar label="검수 대기" value={initialReviewRequired} max={initialTotal} color="bg-warning" />
          <StatBar label="기억 추적 중 (로컬 저장소)" value={isClient ? tracked : 0} max={isClient ? usableCount || 1 : initialUsable || 1} color="bg-accent" />
        </div>
      </div>


      {/* 학습 세부 히스토리 리스트 (프리미엄 디테일 뷰) */}
      {isClient && records.length > 0 && (
        <div className="mt-6 sm:mt-8 rounded-[20px] sm:rounded-card border border-border bg-white p-5 sm:p-6 shadow-card animate-fade-in">
          <h2 className="text-base sm:text-lg font-bold text-ink mb-4">📚 나의 세부 학습 표현록</h2>
          <div className="divide-y divide-border overflow-hidden">
            {records.map((rec) => (
              <div key={rec.learning_object_id} className="py-3 flex items-center justify-between gap-2 text-xs sm:text-sm hover:bg-surface/50 transition px-2 rounded-lg">
                <div>
                  <p className="font-bold text-ink">{rec.expression}</p>
                  <p className="text-[11px] sm:text-xs text-muted">
                    정답: <span className="text-success font-semibold">{rec.correct_count}</span> | 오답: <span className="text-accent font-semibold">{rec.incorrect_count}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${rec.forgetting_risk >= 70 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    위험도 {rec.forgetting_risk}%
                  </span>
                  <p className="text-[10px] text-faint mt-1">강도 {rec.memory_strength}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressCard({ icon, label, value, sublabel, color, delay }: { icon: string; label: string; value: number; sublabel: string; color: "primary" | "success" | "accent"; delay: number; }) {
  const textMap = {
    primary: "text-primary",
    success: "text-success",
    accent: "text-accent",
  };

  return (
    <div className="card-enter rounded-[20px] sm:rounded-card border border-border bg-white p-3 sm:p-5 shadow-card min-w-0 w-full box-border" style={{ animationDelay: `${delay * 80}ms` }}>
      <div className="text-lg sm:text-2xl">{icon}</div>
      <p className="mt-1.5 sm:mt-3 text-[10px] sm:text-xs font-semibold text-muted truncate min-w-0">{label}</p>
      <p className={`mt-1 text-base sm:text-2xl font-extrabold ${textMap[color]} truncate`}>{value}</p>
      <p className="mt-0.5 text-[9px] sm:text-xs text-faint truncate min-w-0">{sublabel}</p>
    </div>
  );
}


function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string; }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-bold text-muted">{value} / {max}</span>
      </div>
      <div className="mt-1.5 h-2 sm:h-2.5 rounded-full bg-surface overflow-hidden">
        <div className={`h-2 sm:h-2.5 rounded-full ${color} animate-progress-fill`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
