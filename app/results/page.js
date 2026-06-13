"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function scoreStyle(score) {
  if (score >= 80) return "bg-green-100 text-green-700";
  if (score >= 60) return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-600";
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const r = sessionStorage.getItem("scholarscout_results");
    const p = sessionStorage.getItem("scholarscout_profile");

    try {
      if (r && r !== "undefined") {
        setResults(JSON.parse(r));
      }

      if (p && p !== "undefined") {
        setProfile(JSON.parse(p));
      }
    } catch (err) {
      console.error("SessionStorage parse error:", err);
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  if (results.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No results yet.</p>
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 text-sm underline"
          >
            ← Back to search
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Your Matches</h1>
            {profile && (
              <p className="text-sm text-gray-500 mt-1">
                {profile.fieldOfStudy} · {profile.nationality} ·{" "}
                {profile.degreeLevel}
              </p>
            )}
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← New search
          </button>
        </div>

        <div className="space-y-4">
          {results.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-base font-semibold text-gray-800 leading-snug">
                  {s.name}
                </h2>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full shrink-0 ${scoreStyle(s.score)}`}
                >
                  {s.score}/100
                </span>
              </div>

              <div className="flex gap-5 text-sm text-gray-500 mb-3">
                <span>{s.amount}</span>
                <span>{s.deadline}</span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {s.explanation}
              </p>

              {s.disclaimer && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                  {s.disclaimer}
                </p>
              )}

              {s.link ? (
                <a
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors"
                >
                  Apply →
                </a>
              ) : (
                <span className="text-xs text-gray-400">
                  Apply link not available
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
