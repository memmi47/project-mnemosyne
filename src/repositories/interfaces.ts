import { LearningEvent, LearningObject, MemoryObject, Recommendation } from "../domain/models";

export interface LearningObjectRepository {
  findAll(): Promise<LearningObject[]>;
  findById(id: string): Promise<LearningObject | null>;
}

export interface MemoryRepository {
  findByUser(userId: string): Promise<MemoryObject[]>;
  findByLearningObject(userId: string, learningObjectId: string): Promise<MemoryObject | null>;
  save(memoryObject: MemoryObject): Promise<void>;
}

export interface EventRepository {
  append(event: LearningEvent): Promise<void>;
  findByLearningObject(userId: string, learningObjectId: string): Promise<LearningEvent[]>;
}

export interface RecommendationRepository {
  saveMany(userId: string, recommendations: Recommendation[]): Promise<void>;
  findPending(userId: string): Promise<Recommendation[]>;
}
