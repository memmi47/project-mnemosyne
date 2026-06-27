import { MemoryDashboard } from "@/components/memory-dashboard";
import { getProgressSummary } from "@/src/services/progress-service";
import Link from "next/link";

export default async function ProgressPage() {
  const progress = await getProgressSummary();

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <Link className="text-sm font-medium text-moss" href="/">
          Today Mission
        </Link>
        <MemoryDashboard progress={progress} />
      </div>
    </main>
  );
}
