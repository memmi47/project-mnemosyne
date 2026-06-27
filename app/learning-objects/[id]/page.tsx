import { LearningObjectDetail } from "@/components/learning-object-detail";
import { findLearningObjectById } from "@/src/data/static-loader/learning-object-loader";
import Link from "next/link";
import { notFound } from "next/navigation";

interface LearningObjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LearningObjectPage({ params }: LearningObjectPageProps) {
  const { id } = await params;
  const learningObject = await findLearningObjectById(id);

  if (!learningObject) notFound();

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <Link className="text-sm font-medium text-moss" href="/">
          Today Mission
        </Link>
        <LearningObjectDetail learningObject={learningObject} />
      </div>
    </main>
  );
}
