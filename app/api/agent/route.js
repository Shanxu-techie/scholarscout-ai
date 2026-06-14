import { NextResponse } from "next/server";
import { runScholarScoutAgent } from "@/lib/agentRunner";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"),
});

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return Response.json(
        { error: "Too many requests. Please try again in an hour." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { studentProfile } = body;

    if (!studentProfile) {
      return NextResponse.json(
        { error: "studentProfile is required" },
        { status: 400 },
      );
    }

    const results = await runScholarScoutAgent(studentProfile);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Agent route error:", error);
    return NextResponse.json(
      { error: error.message || "Agent failed" },
      { status: 500 },
    );
  }
}
