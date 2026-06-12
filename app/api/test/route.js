import { runScholarScoutAgent } from '@/lib/agentRunner';

export async function GET() {
  const testProfile = {
    fieldOfStudy: 'Computer Science',
    nationality: 'Pakistani',
    degreeLevel: 'Masters',
    gpa: 3.5,
    financialNeed: true,
    preferredCountry: ''
  };

  try {
    const results = await runScholarScoutAgent(testProfile);
    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}