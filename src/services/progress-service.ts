import { loadLearningObjects } from "../data/static-loader/learning-object-loader";
import { findMemoryObjectsByUser } from "../data/learner-state/sqlite-memory-repository";
import { DEFAULT_USER_ID } from "./today-mission-service";

export interface ProgressSummary {
  total_learning_objects: number;
  usable_learning_objects: number;
  review_required_objects: number;
  missing_definition_objects: number;
  missing_examples_objects: number;
  memory_summary: {
    tracked_objects: number;
    average_memory_strength: number;
    high_forgetting_risk_objects: number;
  };
}

export async function getProgressSummary(): Promise<ProgressSummary> {
  const dataset = await loadLearningObjects();
  const memoryObjects = await findMemoryObjectsByUser(DEFAULT_USER_ID);
  const trackedObjects = memoryObjects.length;
  const averageMemoryStrength = trackedObjects === 0
    ? 0
    : memoryObjects.reduce((sum, memory) => sum + memory.memory_strength, 0) / trackedObjects;

  return {
    total_learning_objects: dataset.validation.total_count,
    usable_learning_objects: dataset.validation.usable_count,
    review_required_objects: dataset.validation.review_required_count,
    missing_definition_objects: dataset.validation.missing_definition_count,
    missing_examples_objects: dataset.validation.missing_examples_count,
    memory_summary: {
      tracked_objects: trackedObjects,
      average_memory_strength: Math.round(averageMemoryStrength),
      high_forgetting_risk_objects: memoryObjects.filter((memory) => memory.forgetting_risk >= 70).length,
    },
  };
}
