import type { Recommendation } from "../../domain/models";
import { getDatabase } from "../sqlite/database";

export async function saveReviewQueueRecommendation(
  userId: string,
  recommendation: Recommendation,
  scheduledAt: string
): Promise<void> {
  const db = getDatabase();

  // 같은 Learning Object의 대기열은 최신 기억 상태를 반영하도록 교체한다.
  db.prepare(`
    UPDATE review_queue
    SET status = 'replaced'
    WHERE user_id = ? AND learning_object_id = ? AND status = 'pending'
  `).run(userId, recommendation.learning_object_id);

  db.prepare(`
    INSERT INTO review_queue (
      queue_id,
      user_id,
      learning_object_id,
      activity_type,
      priority_score,
      reason,
      scheduled_at,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    `queue_${recommendation.recommendation_id}_${Date.now()}`,
    userId,
    recommendation.learning_object_id,
    recommendation.activity_type,
    recommendation.priority_score,
    recommendation.reason,
    scheduledAt
  );
}
