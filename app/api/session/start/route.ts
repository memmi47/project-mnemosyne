import { NextResponse } from "next/server";
import { startSession, type StartSessionRequest } from "@/src/services/session-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<StartSessionRequest>;
    if (!body.session_id) throw new Error("session_id가 필요합니다.");
    if (!body.learning_object_id) throw new Error("learning_object_id가 필요합니다.");
    if (!body.activity_type) throw new Error("activity_type이 필요합니다.");

    return NextResponse.json(await startSession({
      session_id: body.session_id,
      learning_object_id: body.learning_object_id,
      activity_type: body.activity_type,
    }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "세션 시작에 실패했습니다." },
      { status: 400 }
    );
  }
}
