import { NextResponse } from "next/server";
import { requestHint, type HintRequest } from "@/src/services/hint-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<HintRequest>;
    if (!body.session_id) throw new Error("session_id가 필요합니다.");
    if (!body.learning_object_id) throw new Error("learning_object_id가 필요합니다.");
    if (!body.activity_type) throw new Error("activity_type이 필요합니다.");

    return NextResponse.json(await requestHint({
      session_id: body.session_id,
      learning_object_id: body.learning_object_id,
      activity_type: body.activity_type,
      attempt_count: Number(body.attempt_count ?? 1),
    }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "힌트 요청에 실패했습니다." },
      { status: 400 }
    );
  }
}
