import { nanoid } from "nanoid";
import { z } from "zod";
import { CATEGORIES, type Candidate, type CandidateQualification } from "@/types";

const CategoryEnum = z.enum(CATEGORIES);

const rowSchema = z.object({
  "Roll No": z.union([z.string(), z.number()]).transform((v) => String(v).trim()),
  Name: z.string().min(1),
  Category: CategoryEnum,
  Age: z.coerce.number().int().min(16).max(80),
  "Qualification 1 Degree": z.string().min(1),
  "Qualification 1 Stream": z.string().min(1),
  "Qualification 1 %": z.coerce.number().min(0).max(100),
  "Qualification 2 Degree": z.union([z.string(), z.null(), z.undefined()]).optional(),
  "Qualification 2 Stream": z.union([z.string(), z.null(), z.undefined()]).optional(),
  "Qualification 2 %": z.union([z.coerce.number(), z.null(), z.undefined()]).optional(),
  "Written Marks": z.coerce.number().min(0),
  "Practical Marks": z.coerce.number().min(0),
  "Interview Marks": z.coerce.number().min(0),
  Preferences: z.union([z.string(), z.null(), z.undefined()]).optional(),
  PwD: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export type ImportError = { row: number; message: string };
export type ImportResult = { candidates: Candidate[]; errors: ImportError[] };

export const TEMPLATE_COLUMNS = [
  "Roll No",
  "Name",
  "Category",
  "Age",
  "Qualification 1 Degree",
  "Qualification 1 Stream",
  "Qualification 1 %",
  "Qualification 2 Degree",
  "Qualification 2 Stream",
  "Qualification 2 %",
  "Written Marks",
  "Practical Marks",
  "Interview Marks",
  "Preferences",
  "PwD",
] as const;

const EXAMPLE_ROW = {
  "Roll No": "NSSB25001",
  Name: "Example Candidate",
  Category: "UR",
  Age: 24,
  "Qualification 1 Degree": "B.Tech",
  "Qualification 1 Stream": "Computer Science",
  "Qualification 1 %": 72,
  "Qualification 2 Degree": "",
  "Qualification 2 Stream": "",
  "Qualification 2 %": "",
  "Written Marks": 145,
  "Practical Marks": 32,
  "Interview Marks": 24,
  Preferences: "VAC-2024-001, VAC-2024-002",
  PwD: "N",
};

const INSTRUCTIONS_ROW = {
  "Roll No": "Required. Must be unique.",
  Name: "Required.",
  Category: "One of UR, ST, BT, OBC, EWS, Indigenous.",
  Age: "Required integer.",
  "Qualification 1 Degree": "Required.",
  "Qualification 1 Stream": "Required.",
  "Qualification 1 %": "0–100.",
  "Qualification 2 Degree": "Optional.",
  "Qualification 2 Stream": "Optional.",
  "Qualification 2 %": "Optional.",
  "Written Marks": "Out of 200.",
  "Practical Marks": "Out of 50.",
  "Interview Marks": "Out of 50.",
  Preferences: "Vacancy codes separated by commas.",
  PwD: "Y / N.",
};

export async function downloadTemplate() {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet([EXAMPLE_ROW, INSTRUCTIONS_ROW], {
    header: [...TEMPLATE_COLUMNS],
  });
  ws["!freeze"] = { xSplit: 0, ySplit: 2 };
  ws["!cols"] = TEMPLATE_COLUMNS.map(() => ({ wch: 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Candidates");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nssb-candidate-template.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function parseCandidateFile(
  file: File,
  examId: string,
  existingRolls: Set<string>
): Promise<ImportResult> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return { candidates: [], errors: [{ row: 0, message: "Workbook has no sheet" }] };
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

  const errors: ImportError[] = [];
  const candidates: Candidate[] = [];
  const seenRolls = new Set<string>(existingRolls);

  json.forEach((raw, i) => {
    const rowNum = i + 2; // header is row 1, data starts row 2
    // Skip the "instructions" row (where Roll No contains "Required")
    if (typeof raw["Roll No"] === "string" && /required/i.test(String(raw["Roll No"]))) return;
    if (!raw["Roll No"] || String(raw["Roll No"]).trim() === "") return;

    const parsed = rowSchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      errors.push({
        row: rowNum,
        message: `${issue.path.join(".") || "row"}: ${issue.message}`,
      });
      return;
    }
    const v = parsed.data;
    if (seenRolls.has(v["Roll No"])) {
      errors.push({ row: rowNum, message: `Duplicate Roll No "${v["Roll No"]}"` });
      return;
    }
    seenRolls.add(v["Roll No"]);

    const quals: CandidateQualification[] = [
      {
        degree: v["Qualification 1 Degree"],
        stream: v["Qualification 1 Stream"],
        percentage: v["Qualification 1 %"],
      },
    ];
    if (v["Qualification 2 Degree"] && v["Qualification 2 Stream"] && v["Qualification 2 %"] != null) {
      quals.push({
        degree: String(v["Qualification 2 Degree"]),
        stream: String(v["Qualification 2 Stream"]),
        percentage: Number(v["Qualification 2 %"]),
      });
    }

    const prefs = v.Preferences
      ? String(v.Preferences)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    candidates.push({
      id: `cand-${nanoid(10)}`,
      examId,
      rollNo: v["Roll No"],
      name: v.Name,
      category: v.Category,
      age: v.Age,
      qualifications: quals,
      writtenMarks: v["Written Marks"],
      practicalMarks: v["Practical Marks"],
      interviewMarks: v["Interview Marks"],
      preferences: prefs,
      isPwD: typeof v.PwD === "string" && /^y/i.test(v.PwD.trim()),
    });
  });

  return { candidates, errors };
}
