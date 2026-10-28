import type {
  Candidate,
  MeritEntry,
  Settings,
  Vacancy,
} from "@/types";

export function qualifiesFor(cand: Candidate, v: Vacancy): boolean {
  return v.qualifications.some((q) =>
    cand.qualifications.some(
      (cq) =>
        cq.degree.toLowerCase().includes(q.degree.toLowerCase()) &&
        cq.percentage >= q.minPercentage
    )
  );
}

function qualificationLabel(cand: Candidate): string {
  const q = cand.qualifications[0];
  if (!q) return "—";
  if (q.degree === "12th") return "12th Pass";
  const stream = shortStream(q.stream);
  return stream ? `${q.degree} ${stream}` : q.degree;
}

function shortStream(stream: string): string {
  const map: Record<string, string> = {
    "Computer Science": "CS",
    "Mathematics": "Maths",
    "Political Science": "Pol. Sc.",
    "Commerce": "",
    "Sociology": "Sociology",
    "Agriculture": "Agri.",
    "Civil Engineering": "Civil",
    "Mechanical": "Mech",
    "Electrical Engineering": "Elec",
    "Any Discipline": "",
  };
  return map[stream] ?? stream.slice(0, 10);
}

export function computeMerit(
  candidates: Candidate[],
  vacancies: Vacancy[],
  settings: Settings
): MeritEntry[] {
  const examId = settings.examSettings.activeExamId;
  const examCandidates = candidates.filter((c) => c.examId === examId);
  const examVacancies = vacancies.filter((v) => v.examId === examId);

  const maxTotal =
    settings.examSettings.maxWrittenMarks +
    settings.examSettings.maxPracticalMarks +
    settings.examSettings.maxInterviewMarks;
  const passingTotal = (settings.examSettings.passingPercentage / 100) * maxTotal;

  const scored = examCandidates.map((c) => {
    const total = c.writtenMarks + c.practicalMarks + c.interviewMarks;
    const qualifiesAny = examVacancies.length === 0
      ? false
      : examVacancies.some((v) => qualifiesFor(c, v));
    let eligible = true;
    let reason: string | undefined;
    if (total < passingTotal) {
      eligible = false;
      reason = `Total ${total} below passing (${Math.round(passingTotal)})`;
    } else if (!qualifiesAny) {
      eligible = false;
      reason = "No matching qualification";
    }
    return { c, total, eligible, reason };
  });

  // tie-breaker
  const tie = settings.allocationPrefs.tieBreaker;
  scored.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (tie === "written") return b.c.writtenMarks - a.c.writtenMarks;
    if (tie === "age") return a.c.age - b.c.age;
    return 0; // random/stable
  });

  return scored.map((s, i) => ({
    rank: i + 1,
    candidateId: s.c.id,
    rollNo: s.c.rollNo,
    name: s.c.name,
    category: s.c.category,
    written: s.c.writtenMarks,
    practical: s.c.practicalMarks,
    interview: s.c.interviewMarks,
    total: s.total,
    qualificationLabel: qualificationLabel(s.c),
    eligible: s.eligible,
    eligibilityReason: s.reason,
  }));
}
