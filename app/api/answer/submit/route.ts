import { NextResponse } from "next/server";
import { submitAnswer, type SubmitAnswerRequest } from "@/src/services/answer-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<SubmitAnswerRequest>;
    const parsed = parseSubmitAnswerRequest(body);
    const response = await submitAnswer(parsed);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "답안 제출에 실패했습니다." },
      { status: 400 }
    );
  }
}

function parseSubmitAnswerRequest(body: Partial<SubmitAnswerRequest>): SubmitAnswerRequest {
  if (!body.session_id) throw new Error("session_id가 필요합니다.");
  if (!body.learning_object_id) throw new Error("learning_object_id가 필요합니다.");
  if (!body.activity_type) throw new Error("activity_type이 필요합니다.");

  return {
    session_id: body.session_id,
    learning_object_id: body.learning_object_id,
    activity_type: body.activity_type,
    answer: body.answer ?? "",
    response_latency_ms: Number(body.response_latency_ms ?? 0),
    hint_used: Boolean(body.hint_used),
    attempt_count: Number(body.attempt_count ?? 1),
  };
}
