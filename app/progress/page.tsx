import { getProgressSummary } from "@/src/services/progress-service";
import { ProgressClientView } from "@/components/progress-client-view";

export default async function ProgressPage() {
  const progress = await getProgressSummary();

  return (
    <ProgressClientView
      initialTotal={progress.total_learning_objects}
      initialUsable={progress.usable_learning_objects}
      initialReviewRequired={progress.review_required_objects}
    />
  );
}
