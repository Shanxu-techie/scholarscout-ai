import { NextResponse } from 'next/server';
import { runScholarScoutAgent } from '@/lib/agentRunner';

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentProfile } = body;

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'studentProfile is required' },
        { status: 400 }
      );
    }

    const results = await runScholarScoutAgent(studentProfile);
    return NextResponse.json({ success: true, results });

  } catch (error) {
    console.error('Agent route error:', error);
    return NextResponse.json(
      { error: error.message || 'Agent failed' },
      { status: 500 }
    );
  }
}