export function TutorHintPanel() {
  return (
    <aside className="border border-mist bg-white p-5 shadow-sm md:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">AI Tutor Coach</p>
      <h2 className="mt-3 text-xl font-black text-ink">힌트 우선</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        첫 시도에서는 정답을 바로 보여주지 않습니다. 표현의 의미, 문맥, 혼동 가능성을
        순서대로 떠올리도록 돕습니다.
      </p>
      <div className="mt-5 space-y-3 border-t border-mist pt-5">
        <Step label="1" text="의미 단서" />
        <Step label="2" text="문맥 단서" />
        <Step label="3" text="혼동 표현 비교" />
      </div>
      <p className="mt-5 border border-mist bg-paper p-3 text-sm font-bold leading-6 text-muted">
        힌트와 세션 완료는 왼쪽 학습 카드에서 기록과 함께 처리됩니다.
      </p>
    </aside>
  );
}

function Step({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-7 w-7 bg-primary-soft text-center text-xs font-black leading-7 text-primary">
        {label}
      </span>
      <span className="text-sm font-bold text-ink">{text}</span>
    </div>
  );
}
