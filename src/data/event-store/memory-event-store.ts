import type { LearningEvent } from "../../domain/models";

export class MemoryEventStore {
  private readonly events: LearningEvent[] = [];

  async append(event: LearningEvent): Promise<void> {
    this.events.push(event);
  }

  async findByLearningObject(userId: string, learningObjectId: string): Promise<LearningEvent[]> {
    return this.events.filter(
      (event) => event.user_id === userId && event.learning_object_id === learningObjectId
    );
  }

  async findAll(): Promise<LearningEvent[]> {
    return [...this.events];
  }
}
