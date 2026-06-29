"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getStarredRecords, toggleStarred, type LocalMemoryRecord } from "@/src/services/local-memory-service";

export function BookmarksClientView({ loMapJson }: { loMapJson: Record<string, { definition_ko: string; unit?: number }> }) {
  const [bookmarks, setBookmarks] = useState<LocalMemoryRecord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    setBookmarks(getStarredRecords());
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleUnstar = (learningObjectId: string, expression: string) => {
    toggleStarred(learningObjectId, expression);
    setBookmarks(getStarredRecords());
    triggerToast(`⭐ '${expression}' 별표 해제 완료`);
  };

  if (!isClient) {
    return <div className="mx-auto max-w-4xl px-4 py-12 text-center text-muted">단어장 로딩 중...</div>;
  }

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-5 sm:py-12 w-full box-border">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-ink text-white px-5 py-3 rounded-full text-xs font-extrabold shadow-toast animate-mn-pop whitespace-nowrap">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xs font-bold text-faint hover:text-primary transition">← 홈으로</Link>
            <span className="text-faint">·</span>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent shadow-xs">
              ⭐ 즐겨찾기 단어장
            </span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            내 별표 단어 모아보기
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            내가 집중적으로 더 학습하고 싶어 별표(⭐)를 쳐둔 숙어 리스트입니다.
          </p>
        </div>

        {bookmarks.length > 0 && (
          <Link
            href="/session?mode=starred"
            className="inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-btn bg-gradient-to-r from-accent to-warning px-6 text-sm sm:text-base font-extrabold text-white shadow-btn transition hover:shadow-btn-hover hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-lg">🚀</span>
            <span>별표 단어 전용 퀴즈 시작</span>
          </Link>
        )}
      </div>

      {/* Content List */}
      {bookmarks.length === 0 ? (
        <div className="mt-12 overflow-hidden rounded-card border border-border bg-white p-12 text-center shadow-card animate-fade-in">
          <div className="text-5xl">📭</div>
          <h2 className="mt-4 text-xl font-extrabold text-ink">별표 쳐둔 단어가 아직 없습니다</h2>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            학습 세션이나 단어 카드 화면에서 별표(⭐) 버튼을 눌러 나만의 집중 학습 단어장을 만들어 보세요.
          </p>
          <Link
            href="/session"
            className="mt-6 inline-flex h-12 items-center rounded-btn bg-primary px-6 text-sm font-bold text-white shadow-btn transition hover:shadow-btn-hover"
          >
            학습 시작하러 가기
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 w-full box-border">
          {bookmarks.map((b, idx) => {
            const staticInfo = loMapJson[b.learning_object_id];
            const meaning = staticInfo?.definition_ko || "의미 정보 없음";
            const unitNum = staticInfo?.unit;

            return (
              <div
                key={b.learning_object_id}
                className="card-enter relative flex flex-col justify-between rounded-card border border-border bg-white p-5 shadow-card transition-all hover:shadow-card-hover hover:border-accent/40 w-full box-border"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="truncate text-base sm:text-lg font-extrabold text-ink">
                        {b.expression}
                      </h3>
                      {unitNum && (
                        <span className="rounded-badge bg-surface px-2 py-0.5 text-[10px] font-bold text-muted">
                          Unit {unitNum}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnstar(b.learning_object_id, b.expression)}
                      title="별표 해제"
                      className="flex h-8 w-8 items-center justify-center rounded-btn text-accent hover:bg-accent-soft transition active:scale-90 flex-shrink-0"
                    >
                      ⭐
                    </button>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm font-medium text-muted line-clamp-2">
                    {meaning}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-faint">
                  <span>기억 강도: {Math.round(b.memory_strength)}%</span>
                  <span>위험도: {Math.round(b.forgetting_risk)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
