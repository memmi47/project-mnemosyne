import { NextResponse } from "next/server";
import { getTodayMission } from "@/src/services/today-mission-service";

export async function GET() {
  const mission = await getTodayMission();
  return NextResponse.json(mission);
}
