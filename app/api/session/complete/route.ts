import { NextResponse } from "next/server";
import { completeSession, type CompleteSessionRequest } from "@/src/services/session-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<CompleteSessionRequest>;
    if (!body.session_id) throw new Error("session_id가 필요합니다.");

    return NextResponse.json(await completeSession({ session_id: body.session_id }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "세션 완료에 실패했습니다." },
      { status: 400 }
    );
  }
}
