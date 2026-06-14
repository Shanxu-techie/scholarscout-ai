import OpenAI from "openai";
import { DefaultAzureCredential } from "@azure/identity";
import { readFileSync } from "fs";
import { join } from "path";

const AZURE_ENDPOINT =
  "https://scholarscout-hub-v2.services.ai.azure.com/openai/v1";
const DEPLOYMENT = "gpt-4.1-mini";

const scholarships = JSON.parse(
  readFileSync(join(process.cwd(), "data", "scholarships.json"), "utf-8"),
);

export const tools = [
  {
    type: "function",
    function: {
      name: "getScholarships",
      description:
        "Retrieves the full list of available scholarships. Always call this first.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "filterScholarships",
      description:
        "Filters scholarships by student eligibility. Call after getScholarships.",
      parameters: {
        type: "object",
        properties: {
          studentProfile: {
            type: "object",
            description: "The student profile",
          },
          scholarshipList: {
            type: "array",
            description: "Full scholarship list to filter",
          },
        },
        required: ["studentProfile", "scholarshipList"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "rankScholarships",
      description:
        "Scores each scholarship 0-100 based on match quality. Call after filtering.",
      parameters: {
        type: "object",
        properties: {
          filteredList: {
            type: "array",
            description: "Eligible scholarships to rank",
          },
          studentProfile: {
            type: "object",
            description: "The student profile",
          },
        },
        required: ["filteredList", "studentProfile"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "explainMatch",
      description:
        "Generates a personalised explanation for why a scholarship matches the student.",
      parameters: {
        type: "object",
        properties: {
          scholarship: {
            type: "object",
            description: "The scholarship object",
          },
          studentProfile: {
            type: "object",
            description: "The student profile",
          },
          score: { type: "number", description: "The match score 0-100" },
        },
        required: ["scholarship", "studentProfile", "score"],
      },
    },
  },
];

const COMMONWEALTH = [
  "Pakistan",
  "India",
  "Bangladesh",
  "Nigeria",
  "Kenya",
  "Ghana",
  "Uganda",
  "Tanzania",
  "Sri Lanka",
  "Malaysia",
  "Singapore",
  "Australia",
  "Canada",
  "United Kingdom",
  "UK",
  "New Zealand",
  "South Africa",
  "Jamaica",
  "Nepal",
];

const DEVELOPING = [
  "Pakistan",
  "India",
  "Bangladesh",
  "Nigeria",
  "Kenya",
  "Ghana",
  "Ethiopia",
  "Uganda",
  "Tanzania",
  "Philippines",
  "Indonesia",
  "Vietnam",
  "Sri Lanka",
  "Nepal",
  "Myanmar",
  "Cambodia",
  "Senegal",
  "Rwanda",
  "Zambia",
  "Zimbabwe",
];

const isCommonwealth = (nationality) =>
  COMMONWEALTH.some((c) => nationality.toLowerCase().includes(c.toLowerCase()));

const isDeveloping = (nationality) =>
  DEVELOPING.some((c) => nationality.toLowerCase().includes(c.toLowerCase()));

export function executeGetScholarships() {
  return scholarships;
}

const FIELD_GROUPS = {
  "computer science": [
    "cs",
    "computing",
    "technology",
    "information technology",
    "it",
    "stem",
    "engineering",
    "software",
    "data science",
  ],
  engineering: [
    "stem",
    "technology",
    "computer science",
    "sciences",
    "technical",
  ],
  medicine: [
    "health",
    "medical",
    "biomedical",
    "health sciences",
    "life sciences",
    "pharmacy",
  ],
  business: ["economics", "finance", "management", "commerce", "accounting"],
  law: ["legal", "jurisprudence", "international relations"],
  arts: ["humanities", "social sciences", "literature", "linguistics"],
  science: ["stem", "natural sciences", "physics", "chemistry", "biology"],
};

const FIELD_NORMALIZE = {
  cs: "computer science",
  "software engineering": "computer science",
  "data science": "computer science",
  it: "computer science",
  biz: "business",
  econ: "business",
  med: "medicine",
  bio: "science",
};

function normalizeField(field) {
  const f = field.toLowerCase().trim();
  return FIELD_NORMALIZE[f] || f;
}

function fieldsMatch(studentField, scholarshipField) {
  const sf = normalizeField(studentField);
  const schF = scholarshipField.toLowerCase();

  if (sf.includes(schF) || schF.includes(sf)) return true;

  const synonyms = FIELD_GROUPS[sf] || [];
  return synonyms.some((syn) => schF.includes(syn) || syn.includes(schF));
}

export function executeFilterScholarships(studentProfile, scholarshipList) {
  return scholarshipList.filter((s) => {
    const eligible = s.eligible_countries || [];

    const nationalityOk =
      eligible.includes("Any") ||
      eligible.some(
        (c) => c.toLowerCase() === studentProfile.nationality.toLowerCase(),
      ) ||
      (eligible.includes("Commonwealth Countries") &&
        isCommonwealth(studentProfile.nationality)) ||
      (eligible.includes("Developing Nations") &&
        isDeveloping(studentProfile.nationality));

    if (!nationalityOk) return false;

    if (s.fields && s.fields.length > 0) {
      const fieldOk = s.fields.some((f) =>
        fieldsMatch(studentProfile.fieldOfStudy, f),
      );
      if (!fieldOk) return false;
    }

    return true;
  });
}

export function executeRankScholarships(filteredList, studentProfile) {
  const ranked = filteredList.map((s) => {
    let score = 50;

    if (
      s.fields &&
      s.fields.some((f) => fieldsMatch(studentProfile.fieldOfStudy, f))
    )
      score += 20;

    if (
      (s.eligible_countries || []).some(
        (c) => c.toLowerCase() === studentProfile.nationality.toLowerCase(),
      )
    )
      score += 15;

    if (s.financial_need && studentProfile.financialNeed) score += 10;
    if (!s.financial_need) score += 5;

    if (studentProfile.gpa >= 3.7) score += 10;
    else if (studentProfile.gpa >= 3.0) score += 5;

    return { ...s, score: Math.min(score, 100) };
  });

  return ranked.sort((a, b) => b.score - a.score);
}

export function executeExplainMatch(scholarship, studentProfile, score) {
  const reasons = [];

  if (
    scholarship.fields &&
    scholarship.fields.some((f) => fieldsMatch(studentProfile.fieldOfStudy, f))
  )
    reasons.push(
      `your ${studentProfile.fieldOfStudy} background matches this scholarship's focus`,
    );

  const eligible = scholarship.eligible_countries || [];
  if (
    eligible.some(
      (c) => c.toLowerCase() === studentProfile.nationality.toLowerCase(),
    )
  ) {
    reasons.push(
      `${studentProfile.nationality} is directly listed as eligible`,
    );
  } else if (eligible.includes("Any")) {
    reasons.push(`open to all nationalities`);
  } else if (
    eligible.includes("Commonwealth Countries") &&
    isCommonwealth(studentProfile.nationality)
  ) {
    reasons.push(
      `${studentProfile.nationality} qualifies as a Commonwealth country`,
    );
  } else if (
    eligible.includes("Developing Nations") &&
    isDeveloping(studentProfile.nationality)
  ) {
    reasons.push(
      `${studentProfile.nationality} qualifies under Developing Nations`,
    );
  }

  if (scholarship.financial_need && studentProfile.financialNeed) {
    reasons.push(`your financial need status is a match`);
  }

  const incomplete = !scholarship.fields || scholarship.fields.length === 0;

  return {
    explanation:
      reasons.length > 0
        ? `Strong match — ${reasons.join(", ")}.`
        : `Potential match based on available data.`,
    disclaimer: incomplete
      ? "Some eligibility details are incomplete — verify before applying."
      : null,
  };
}

const SYSTEM_PROMPT = `You are ScholarScout, an AI scholarship advisor.
When a student provides their profile, follow these steps in order:
1. Call getScholarships to load the full scholarship list.
2. Call filterScholarships with the student's profile to remove ineligible scholarships.
3. Call rankScholarships on the filtered list to score each one.
4. Call explainMatch for each of the top 5 results to generate a personalized reason.

Eligibility rules:
- "Any" in eligible_countries → open to all nationalities
- "Commonwealth Countries" → eligible if student is from a Commonwealth nation
- "Developing Nations" → eligible if student is from a developing country

Always complete all 4 tool calls before responding.
Return ONLY a valid JSON array (no extra text) in this format:
[{ "name": "", "score": 0, "amount": "", "deadline": "", "link": "", "explanation": "", "disclaimer": null }]`;

function dispatchTool(name, args) {
  switch (name) {
    case "getScholarships":
      return executeGetScholarships();
    case "filterScholarships":
      return executeFilterScholarships(
        args.studentProfile,
        args.scholarshipList,
      );
    case "rankScholarships":
      return executeRankScholarships(args.filteredList, args.studentProfile);
    case "explainMatch":
      return executeExplainMatch(
        args.scholarship,
        args.studentProfile,
        args.score,
      );
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export async function runScholarScoutAgent(studentProfile) {
  // Get Azure bearer token
  const credential = new DefaultAzureCredential();
  const tokenResponse = await credential.getToken(
    "https://ai.azure.com/.default",
  );

  const client = new OpenAI({
    baseURL: AZURE_ENDPOINT,
    apiKey: tokenResponse.token,
  });

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Find scholarships for this student: ${JSON.stringify(studentProfile)}`,
    },
  ];

  let response = await client.chat.completions.create({
    model: DEPLOYMENT,
    messages,
    tools,
    tool_choice: "auto",
  });

  while (response.choices[0].finish_reason === "tool_calls") {
    const toolCalls = response.choices[0].message.tool_calls;

    messages.push(response.choices[0].message);

    for (const toolCall of toolCalls) {
      const args = JSON.parse(toolCall.function.arguments);
      const result = dispatchTool(toolCall.function.name, args);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    response = await client.chat.completions.create({
      model: DEPLOYMENT,
      messages,
      tools,
      tool_choice: "auto",
    });
  }

  const raw = response.choices[0].message.content;
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : JSON.parse(raw);
  } catch {
    return [{ error: "Failed to parse response", raw }];
  }
}
