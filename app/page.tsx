import { TodayMissionCard } from "@/components/today-mission-card";
import { getTodayMission } from "@/src/services/today-mission-service";

export default async function HomePage() {
  const mission = await getTodayMission();

  return (
    <main className="min-h-screen bg-paper px-5 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-4 border-b border-mist pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Project Mnemosyne
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">
              Today Mission
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Memory First MVP
          </div>
        </header>

        <TodayMissionCard mission={mission} />
      </div>
    </main>
  );
}
