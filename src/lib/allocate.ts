import { nanoid } from "nanoid";
import type {
  Allocation,
  AllocationRun,
  Candidate,
  Category,
  MeritEntry,
  Settings,
  Vacancy,
} from "@/types";
import { qualifiesFor } from "@/lib/merit";

export function runAllocation(
  candidates: Candidate[],
  vacancies: Vacancy[],
  merit: MeritEntry[],
  prefs: Settings["allocationPrefs"],
  examId: string
): { allocations: Allocation[]; run: AllocationRun } {
  const now = () => new Date().toISOString();

  // Pre-index for speed on 500+ candidates
  const candById = new Map(candidates.map((c) => [c.id, c]));
  const vacById = new Map(vacancies.map((v) => [v.id, v]));

  // 1. Sort eligible merit entries by rank; keep stable
  const eligible = merit.filter((m) => m.eligible).sort((a, b) => a.rank - b.rank);

  // 2. Build per-vacancy per-category seat counters
  const seats: Record<string, Partial<Record<Category, number>>> = {};
  for (const v of vacancies) {
    seats[v.id] = { ...v.seatsByCategory };
  }

  const allocations: Allocation[] = [];

  // 3. Walk the merit list in order
  for (const m of eligible) {
    const cand = candById.get(m.candidateId);
    if (!cand) continue;
    let placed = false;

    const preferredVacs: Vacancy[] =
      prefs.respectPreferences && cand.preferences.length > 0
        ? (cand.preferences
            .map((id) => vacById.get(id))
            .filter(Boolean) as Vacancy[])
        : vacancies;

    for (const v of preferredVacs) {
      if (!qualifiesFor(cand, v)) continue;
      const cat: Category = prefs.respectReservation ? m.category : "UR";
      // Own-category seat
      if ((seats[v.id][cat] ?? 0) > 0) {
        seats[v.id][cat] = (seats[v.id][cat] ?? 0) - 1;
        allocations.push({
          id: nanoid(12),
          examId: v.examId,
          candidateId: cand.id,
          rank: m.rank,
          vacancyId: v.id,
          postName: v.postName,
          department: v.department,
          status: "Allocated",
          allocatedAt: now(),
        });
        placed = true;
        break;
      }
      // Reserved candidates can take UR seats if their own is exhausted
      if (prefs.respectReservation && cat !== "UR" && (seats[v.id].UR ?? 0) > 0) {
        seats[v.id].UR = (seats[v.id].UR ?? 0) - 1;
        allocations.push({
          id: nanoid(12),
          examId: v.examId,
          candidateId: cand.id,
          rank: m.rank,
          vacancyId: v.id,
          postName: v.postName,
          department: v.department,
          status: "Allocated",
          allocatedAt: now(),
        });
        placed = true;
        break;
      }
    }

    if (!placed) {
      const anySeatLeft = Object.values(seats).some((s) =>
        Object.values(s).some((n) => (n ?? 0) > 0)
      );
      allocations.push({
        id: nanoid(12),
        examId,
        candidateId: cand.id,
        rank: m.rank,
        vacancyId: null,
        postName: null,
        department: null,
        status: anySeatLeft ? "Waitlisted" : "Unallocated",
        reason: anySeatLeft
          ? "Qualified but reserved seats exhausted"
          : "No seats remain",
        allocatedAt: now(),
      });
    }
  }

  // 4. Append Not Eligible rows so Results shows every candidate
  for (const m of merit.filter((x) => !x.eligible)) {
    allocations.push({
      id: nanoid(12),
      examId,
      candidateId: m.candidateId,
      rank: m.rank,
      vacancyId: null,
      postName: null,
      department: null,
      status: "Not Eligible",
      reason: m.eligibilityReason,
      allocatedAt: now(),
    });
  }

  const run: AllocationRun = {
    id: nanoid(12),
    examId,
    ranAt: now(),
    totalCandidates: merit.length,
    eligibleCount: eligible.length,
    allocatedCount: allocations.filter((a) => a.status === "Allocated").length,
    waitlistedCount: allocations.filter((a) => a.status === "Waitlisted").length,
    unallocatedCount: allocations.filter((a) => a.status === "Unallocated").length,
    notEligibleCount: allocations.filter((a) => a.status === "Not Eligible").length,
  };

  return { allocations, run };
}
