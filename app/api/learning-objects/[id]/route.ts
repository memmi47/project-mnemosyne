import { NextResponse } from "next/server";
import { findLearningObjectById } from "@/src/data/static-loader/learning-object-loader";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const learningObject = await findLearningObjectById(id);

  if (!learningObject) {
    return NextResponse.json({ error: "Learning Object를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(learningObject);
}
