import type { LearningObject } from "../../domain/models";
import { getDatabase } from "../sqlite/database";

export async function seedLearningObject(learningObject: LearningObject): Promise<void> {
  getDatabase()
    .prepare(`
      INSERT OR IGNORE INTO learning_objects (
        learning_object_id,
        expression,
        sense_id,
        base_verb,
        particles_json,
        definition_en,
        definition_ko,
        grammar_pattern,
        separability,
        transitivity,
        semantic_tags_json,
        context_tags_json,
        source_references_json,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      learningObject.learning_object_id,
      learningObject.expression,
      learningObject.sense_id,
      learningObject.base_verb,
      JSON.stringify(learningObject.particles),
      learningObject.definition_en,
      learningObject.definition_ko,
      learningObject.grammar_pattern,
      learningObject.separability,
      learningObject.transitivity,
      JSON.stringify(learningObject.semantic_tags),
      JSON.stringify(learningObject.context_tags),
      JSON.stringify(learningObject.source_references),
      learningObject.status
    );
}
