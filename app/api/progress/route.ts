import { NextResponse } from "next/server";
import { getProgressSummary } from "@/src/services/progress-service";

export async function GET() {
  return NextResponse.json(await getProgressSummary());
}
