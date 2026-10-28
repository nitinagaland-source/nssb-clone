import type {
  Allocation,
  AllocationRun,
  Candidate,
  Examination,
  Vacancy,
  MeritEntry,
} from "@/types";
import {
  asOfDate,
  makeExcelBlob,
  makePdfWithTable,
  reportTitle,
} from "./shared";

type Ctx = {
  exam: Examination | undefined;
  candidates: Candidate[];
  vacancies: Vacancy[];
  merit: MeritEntry[];
  allocations: Allocation[];
  run?: AllocationRun;
};

export type ReportKey =
  | "merit-list"
  | "vacancy"
  | "dept-allocation"
  | "eligibility"
  | "allocation-results"
  | "complete";

export async function buildReport(
  key: ReportKey,
  format: "pdf" | "xlsx",
  ctx: Ctx
): Promise<Blob> {
  switch (key) {
    case "merit-list":
      return meritList(format, ctx);
    case "vacancy":
      return vacancy(format, ctx);
    case "dept-allocation":
      return deptAllocation(format, ctx);
    case "eligibility":
      return eligibility(format, ctx);
    case "allocation-results":
      return allocationResults(format, ctx);
    case "complete":
      return complete(format, ctx);
  }
}

export function reportFilename(key: ReportKey, exam?: Examination) {
  const safe = exam?.code?.replace(/\//g, "-") ?? "nssb";
  return `${safe}-${key}`;
}

async function meritList(format: "pdf" | "xlsx", ctx: Ctx) {
  const rows = ctx.merit.map((m) => ({
    Rank: m.rank,
    "Roll No": m.rollNo,
    Candidate: m.name,
    Category: m.category,
    Written: m.written,
    Practical: m.practical,
    Interview: m.interview,
    Total: m.total,
    Qualification: m.qualificationLabel,
    Status: m.eligible ? "Eligible" : "Not Eligible",
  }));
  if (format === "xlsx") {
    return makeExcelBlob([
      { name: "Summary", rows: coverRows(ctx) },
      { name: "Merit List", rows },
    ]);
  }
  return makePdfWithTable({
    title: "Merit List Report",
    subtitle: `${reportTitle(ctx.exam)} · As of ${asOfDate()}`,
    columns: Object.keys(rows[0] ?? {}),
    rows: rows.map((r) => Object.values(r) as (string | number)[]),
  });
}

async function vacancy(format: "pdf" | "xlsx", ctx: Ctx) {
  const vacs = ctx.vacancies.filter((v) => v.examId === ctx.exam?.id);
  const rows = vacs.map((v) => ({
    "Vacancy ID": v.vacancyCode,
    Post: v.postName,
    Department: v.department,
    "Total Seats": v.totalSeats,
    Categories: v.categories.join(", "),
    "Seat Split": Object.entries(v.seatsByCategory)
      .map(([c, n]) => `${c}:${n}`)
      .join(" | "),
    Age: v.ageRequirement,
    Qualifications: v.qualifications
      .map((q) => `${q.degree} ${q.stream} ≥${q.minPercentage}%`)
      .join(" | "),
    Status: v.status,
  }));
  if (format === "xlsx") {
    return makeExcelBlob([
      { name: "Summary", rows: coverRows(ctx) },
      { name: "Vacancies", rows },
    ]);
  }
  return makePdfWithTable({
    title: "Vacancy Report",
    subtitle: `${reportTitle(ctx.exam)} · As of ${asOfDate()}`,
    columns: Object.keys(rows[0] ?? { Note: "No vacancies" }),
    rows: rows.map((r) => Object.values(r) as (string | number)[]),
  });
}

async function deptAllocation(format: "pdf" | "xlsx", ctx: Ctx) {
  const map = new Map<string, { allocated: number; waitlisted: number; unallocated: number }>();
  for (const a of ctx.allocations) {
    const dept = a.department ?? "—";
    const curr = map.get(dept) ?? { allocated: 0, waitlisted: 0, unallocated: 0 };
    if (a.status === "Allocated") curr.allocated++;
    else if (a.status === "Waitlisted") curr.waitlisted++;
    else if (a.status === "Unallocated") curr.unallocated++;
    map.set(dept, curr);
  }
  const rows = [...map.entries()].map(([dept, v]) => ({
    Department: dept,
    Allocated: v.allocated,
    Waitlisted: v.waitlisted,
    Unallocated: v.unallocated,
    Total: v.allocated + v.waitlisted + v.unallocated,
  }));
  if (format === "xlsx") {
    return makeExcelBlob([
      { name: "Summary", rows: coverRows(ctx) },
      { name: "Dept Allocation", rows },
    ]);
  }
  return makePdfWithTable({
    title: "Department-wise Allocation",
    subtitle: `${reportTitle(ctx.exam)} · As of ${asOfDate()}`,
    columns: Object.keys(rows[0] ?? { Note: "No allocations" }),
    rows: rows.map((r) => Object.values(r) as (string | number)[]),
  });
}

async function eligibility(format: "pdf" | "xlsx", ctx: Ctx) {
  const perCat = new Map<string, { eligible: number; notEligible: number }>();
  for (const m of ctx.merit) {
    const cur = perCat.get(m.category) ?? { eligible: 0, notEligible: 0 };
    if (m.eligible) cur.eligible++;
    else cur.notEligible++;
    perCat.set(m.category, cur);
  }
  const rows = [...perCat.entries()].map(([cat, v]) => ({
    Category: cat,
    Eligible: v.eligible,
    "Not Eligible": v.notEligible,
    Total: v.eligible + v.notEligible,
    "Eligibility %":
      v.eligible + v.notEligible === 0
        ? 0
        : Math.round((v.eligible / (v.eligible + v.notEligible)) * 100),
  }));
  if (format === "xlsx") {
    return makeExcelBlob([
      { name: "Summary", rows: coverRows(ctx) },
      { name: "Eligibility", rows },
    ]);
  }
  return makePdfWithTable({
    title: "Eligibility Report",
    subtitle: `${reportTitle(ctx.exam)} · As of ${asOfDate()}`,
    columns: Object.keys(rows[0] ?? { Note: "No candidates" }),
    rows: rows.map((r) => Object.values(r) as (string | number)[]),
  });
}

async function allocationResults(format: "pdf" | "xlsx", ctx: Ctx) {
  const candMap = new Map(ctx.candidates.map((c) => [c.id, c]));
  const rows = ctx.allocations
    .sort((a, b) => a.rank - b.rank)
    .map((a) => {
      const c = candMap.get(a.candidateId);
      return {
        Rank: a.rank,
        "Roll No": c?.rollNo ?? "",
        Candidate: c?.name ?? "",
        Category: c?.category ?? "",
        "Allocated Post": a.postName ?? "—",
        Department: a.department ?? "—",
        Status: a.status,
        Reason: a.reason ?? "",
      };
    });
  if (format === "xlsx") {
    return makeExcelBlob([
      { name: "Summary", rows: coverRows(ctx) },
      { name: "Allocation Results", rows },
    ]);
  }
  return makePdfWithTable({
    title: "Allocation Results",
    subtitle: `${reportTitle(ctx.exam)} · As of ${asOfDate()}`,
    columns: Object.keys(rows[0] ?? { Note: "No allocations" }),
    rows: rows.map((r) => Object.values(r) as (string | number)[]),
  });
}

async function complete(format: "pdf" | "xlsx", ctx: Ctx) {
  if (format === "xlsx") {
    // Merge all into one workbook
    const meritRows = ctx.merit.map((m) => ({
      Rank: m.rank,
      "Roll No": m.rollNo,
      Name: m.name,
      Category: m.category,
      Total: m.total,
      Eligible: m.eligible ? "Y" : "N",
    }));
    const vacs = ctx.vacancies.filter((v) => v.examId === ctx.exam?.id).map((v) => ({
      "Vacancy ID": v.vacancyCode,
      Post: v.postName,
      Dept: v.department,
      Seats: v.totalSeats,
    }));
    const candMap = new Map(ctx.candidates.map((c) => [c.id, c]));
    const allocs = ctx.allocations.sort((a, b) => a.rank - b.rank).map((a) => ({
      Rank: a.rank,
      "Roll No": candMap.get(a.candidateId)?.rollNo ?? "",
      Status: a.status,
      Post: a.postName ?? "—",
      Dept: a.department ?? "—",
    }));
    return makeExcelBlob([
      { name: "Summary", rows: coverRows(ctx) },
      { name: "Merit List", rows: meritRows },
      { name: "Vacancies", rows: vacs },
      { name: "Allocations", rows: allocs },
    ]);
  }
  // PDF: use the allocation results pdf as the master view
  return allocationResults(format, ctx);
}

function coverRows(ctx: Ctx) {
  return [
    { Field: "Examination", Value: ctx.exam?.name ?? "—" },
    { Field: "Code", Value: ctx.exam?.code ?? "—" },
    { Field: "As of", Value: asOfDate() },
    { Field: "Candidates", Value: ctx.candidates.filter((c) => c.examId === ctx.exam?.id).length },
    { Field: "Vacancies", Value: ctx.vacancies.filter((v) => v.examId === ctx.exam?.id).reduce((n, v) => n + v.totalSeats, 0) },
    { Field: "Allocated", Value: ctx.run?.allocatedCount ?? 0 },
    { Field: "Waitlisted", Value: ctx.run?.waitlistedCount ?? 0 },
    { Field: "Unallocated", Value: ctx.run?.unallocatedCount ?? 0 },
    { Field: "Not Eligible", Value: ctx.run?.notEligibleCount ?? 0 },
  ];
}
