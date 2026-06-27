import { NextResponse } from "next/server";
import { loadLearningObjects } from "@/src/data/static-loader/learning-object-loader";

export async function GET() {
  const result = await loadLearningObjects();

  return NextResponse.json({
    learning_objects: result.learning_objects,
    validation: result.validation,
  });
}
