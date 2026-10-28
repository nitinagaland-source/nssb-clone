import type {
  Candidate,
  CandidateQualification,
  Category,
  Examination,
  Vacancy,
} from "@/types";
import { useExamStore } from "@/store/exam-store";
import { useVacancyStore } from "@/store/vacancy-store";
import { useCandidateStore } from "@/store/candidate-store";
import { useSettingsStore } from "@/store/settings-store";

// ========== Stable IDs so seed is referential ==========
const EXAM_IDS = {
  CETSE_2026: "exam-cetse-2026",
  CSRE_2025: "exam-csre-2025",
  CETSE_2025: "exam-cetse-2025",
  CASE_2024: "exam-case-2024",
};

const VAC_IDS = {
  LDA: "vac-lda-2024-001",
  SECRET: "vac-sec-2024-002",
  SUBINSP: "vac-si-2024-003",
  TECH: "vac-ta-2024-004",
};

// ========== Deterministic pseudo-random ==========
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const FIRST_NAMES = [
  "Imtiyanger", "Kekhrie", "Lidemo", "Nokmei", "Vilhousienuo", "Asangla", "Pangteang",
  "Along", "Aren", "Bendang", "Chubala", "Diethonuo", "Eyinbemo", "Imlisunep",
  "Kevingulie", "Khetovi", "Limatula", "Meren", "Nchumthung", "Pelesede", "Rukutoli",
  "Senti", "Temsula", "Thungbemo", "Vikheho", "Wati", "Yimkhum", "Zekiye",
  "Akum", "Longshibeni", "Toshi", "Imnala", "Naroba", "Keneilhouvi", "Noklenyangla",
  "Monokali", "Yanrenla", "Shosanla", "Vilaleni", "Khrietuoneinuo", "Beisanuo", "Khonei",
  "Nchumbemo", "Rentukhrielie", "Supongtila",
];

const LAST_NAMES = [
  "Ao", "Angami", "Lotha", "Konyak", "Chang", "Sema", "Phom", "Chakhesang",
  "Rengma", "Zeliang", "Sumi", "Yimchunger", "Khiamniungan", "Pochury", "Kuki",
  "Jamir", "Longchar", "Imsong", "Kikon", "Odyuo", "Tungoe", "Wotsa", "Yanthan",
];

const QUAL_POOL = [
  { degree: "B.Tech", stream: "Computer Science", label: "B.Tech CS" },
  { degree: "BA", stream: "Political Science", label: "BA Pol. Sc." },
  { degree: "B.Sc", stream: "Mathematics", label: "B.Sc Maths" },
  { degree: "B.Com", stream: "Commerce", label: "B.Com" },
  { degree: "MA", stream: "Sociology", label: "MA Sociology" },
  { degree: "B.Sc", stream: "Agriculture", label: "B.Sc Agri." },
  { degree: "BA", stream: "English", label: "BA English" },
  { degree: "B.Sc", stream: "Chemistry", label: "B.Sc Chem" },
  { degree: "BBA", stream: "Business Administration", label: "BBA" },
  { degree: "B.Ed", stream: "Education", label: "B.Ed" },
  { degree: "Diploma", stream: "Civil Engineering", label: "Dip. Civil" },
  { degree: "Diploma", stream: "Electrical Engineering", label: "Dip. Elec" },
  { degree: "B.Tech", stream: "Mechanical", label: "B.Tech Mech" },
  { degree: "MBA", stream: "Management", label: "MBA" },
];

const NOT_ELIGIBLE_QUAL = { degree: "12th", stream: "Humanities", label: "12th Pass" };

const CATS: Category[] = ["UR", "ST", "BT", "OBC", "EWS", "Indigenous"];

// ========== Seed definitions ==========
const now = () => new Date().toISOString();

function seedExams(): Examination[] {
  return [
    {
      id: EXAM_IDS.CETSE_2026,
      code: "NSSB/CETSE/2026",
      name: "Combined Education & Technical Services Examination 2026",
      year: 2026,
      description: "Teaching, lab assistant and technical cadre posts across Nagaland.",
      status: "Upcoming",
      category: "Edu & Tech",
      shortLabel: "CETSE 2026 (Edu & Tech)",
      createdAt: now(),
    },
    {
      id: EXAM_IDS.CSRE_2025,
      code: "NSSB/CSRE/2025",
      name: "Combined Staff Recruitment Examination 2025",
      year: 2025,
      description: "Clerical, assistant and inspector-grade recruitment for state departments.",
      status: "Active",
      category: "Staff Recruitment",
      shortLabel: "CSRE 2025 (Staff Recruitment)",
      createdAt: now(),
    },
    {
      id: EXAM_IDS.CETSE_2025,
      code: "NSSB/CETSE/2025",
      name: "Combined Educational & Technical Services Examination 2025",
      year: 2025,
      description: "Previous cycle of CETSE — completed and published.",
      status: "Completed",
      category: "Edu & Tech",
      shortLabel: "CETSE 2025 (Edu & Tech)",
      createdAt: now(),
    },
    {
      id: EXAM_IDS.CASE_2024,
      code: "NSSB/CASE/2024",
      name: "Clerical & Allied Services Examination 2024",
      year: 2024,
      description: "LDA, UDA and allied clerical posts — completed.",
      status: "Completed",
      category: "Clerical & Allied",
      shortLabel: "CASE 2024 (Clerical & Allied)",
      createdAt: now(),
    },
  ];
}

function seedVacancies(): Vacancy[] {
  return [
    {
      id: VAC_IDS.LDA,
      examId: EXAM_IDS.CSRE_2025,
      vacancyCode: "VAC-2024-001",
      postName: "LDA/Computer Assistant",
      department: "School Education",
      totalSeats: 120,
      categories: ["UR", "Indigenous"],
      seatsByCategory: { UR: 72, Indigenous: 48 },
      ageRequirement: "21-35 Years",
      qualifications: [
        { id: "q1", degree: "Graduate", stream: "Any Discipline", minPercentage: 50 },
      ],
      status: "Active",
      createdAt: now(),
    },
    {
      id: VAC_IDS.SECRET,
      examId: EXAM_IDS.CSRE_2025,
      vacancyCode: "VAC-2024-002",
      postName: "Secretariat Assistant",
      department: "P & AR",
      totalSeats: 45,
      categories: ["UR", "BT"],
      seatsByCategory: { UR: 27, BT: 18 },
      ageRequirement: "21-32 Years",
      qualifications: [
        { id: "q1", degree: "Graduate", stream: "with Computer Knowledge", minPercentage: 50 },
      ],
      status: "Active",
      createdAt: now(),
    },
    {
      id: VAC_IDS.SUBINSP,
      examId: EXAM_IDS.CSRE_2025,
      vacancyCode: "VAC-2024-003",
      postName: "Sub-Inspector",
      department: "Home Police",
      totalSeats: 80,
      categories: ["UR", "Indigenous"],
      seatsByCategory: { UR: 48, Indigenous: 32 },
      ageRequirement: "21-30 Years",
      qualifications: [
        { id: "q1", degree: "Graduate", stream: "Any (Physical Standards Apply)", minPercentage: 50 },
      ],
      status: "Active",
      createdAt: now(),
    },
    {
      id: VAC_IDS.TECH,
      examId: EXAM_IDS.CSRE_2025,
      vacancyCode: "VAC-2024-004",
      postName: "Technical Assistant",
      department: "PWD (R&B)",
      totalSeats: 25,
      categories: ["UR", "BT"],
      seatsByCategory: { UR: 15, BT: 10 },
      ageRequirement: "21-35 Years",
      qualifications: [
        { id: "q1", degree: "Diploma", stream: "Civil Engineering", minPercentage: 50 },
      ],
      status: "Draft",
      createdAt: now(),
    },
  ];
}

// First 7 candidates match the Merit List screenshot exactly
const SCREENSHOT_CANDIDATES: Omit<Candidate, "id" | "examId">[] = [
  {
    rollNo: "NSSB24001",
    name: "Imtiyanger Ao",
    category: "ST",
    age: 24,
    qualifications: [{ degree: "B.Tech", stream: "Computer Science", percentage: 78 }],
    writtenMarks: 185,
    practicalMarks: 45,
    interviewMarks: 28,
    preferences: [VAC_IDS.LDA, VAC_IDS.SECRET],
  },
  {
    rollNo: "NSSB24089",
    name: "Kekhrie Angami",
    category: "ST",
    age: 25,
    qualifications: [{ degree: "BA", stream: "Political Science", percentage: 72 }],
    writtenMarks: 182,
    practicalMarks: 42,
    interviewMarks: 30,
    preferences: [VAC_IDS.SUBINSP, VAC_IDS.LDA],
  },
  {
    rollNo: "NSSB24112",
    name: "Lidemo Lotha",
    category: "BT",
    age: 23,
    qualifications: [{ degree: "B.Sc", stream: "Mathematics", percentage: 75 }],
    writtenMarks: 180,
    practicalMarks: 48,
    interviewMarks: 25,
    preferences: [VAC_IDS.SECRET, VAC_IDS.LDA],
  },
  {
    rollNo: "NSSB24205",
    name: "Nokmei Konyak",
    category: "BT",
    age: 26,
    qualifications: [
      { degree: "B.Com", stream: "Commerce", percentage: 68 },
      { degree: "Diploma", stream: "Civil Engineering", percentage: 65 },
    ],
    writtenMarks: 178,
    practicalMarks: 40,
    interviewMarks: 26,
    preferences: [VAC_IDS.TECH, VAC_IDS.LDA],
  },
  {
    rollNo: "NSSB24188",
    name: "Vilhousienuo Z",
    category: "ST",
    age: 27,
    qualifications: [{ degree: "MA", stream: "Sociology", percentage: 70 }],
    writtenMarks: 177,
    practicalMarks: 39,
    interviewMarks: 27,
    preferences: [VAC_IDS.LDA],
  },
  {
    rollNo: "NSSB24330",
    name: "Asangla Chang",
    category: "ST",
    age: 22,
    qualifications: [{ degree: "12th", stream: "Humanities", percentage: 60 }],
    writtenMarks: 175,
    practicalMarks: 38,
    interviewMarks: 29,
    preferences: [VAC_IDS.LDA],
  },
  {
    rollNo: "NSSB24401",
    name: "Pangteang K",
    category: "ST",
    age: 25,
    qualifications: [{ degree: "B.Sc", stream: "Agriculture", percentage: 71 }],
    writtenMarks: 170,
    practicalMarks: 42,
    interviewMarks: 28,
    preferences: [VAC_IDS.LDA, VAC_IDS.SECRET],
  },
];

function seedCandidates(): Candidate[] {
  const rng = makeRng(0xc5e2025);
  const all: Candidate[] = SCREENSHOT_CANDIDATES.map((c, i) => ({
    id: `cand-${String(i + 1).padStart(4, "0")}`,
    examId: EXAM_IDS.CSRE_2025,
    ...c,
  }));

  const vacancyIdPool = [VAC_IDS.LDA, VAC_IDS.SECRET, VAC_IDS.SUBINSP, VAC_IDS.TECH];
  const usedRolls = new Set(all.map((c) => c.rollNo));

  for (let i = all.length; i < 500; i++) {
    const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const name = `${first} ${last}`;
    // normal-ish distribution for written marks around 130, sd ~ 25
    const rNorm = () => {
      let u = 0, v = 0;
      while (u === 0) u = rng();
      while (v === 0) v = rng();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    const written = Math.round(Math.max(40, Math.min(195, 130 + rNorm() * 25)));
    const practical = Math.round(Math.max(10, Math.min(49, 32 + rNorm() * 7)));
    const interview = Math.round(Math.max(10, Math.min(49, 22 + rNorm() * 6)));
    const cat = CATS[Math.floor(rng() * CATS.length)];

    const isNotEligible = rng() < 0.05;
    const pickQual = QUAL_POOL[Math.floor(rng() * QUAL_POOL.length)];
    const quals: CandidateQualification[] = isNotEligible
      ? [{ degree: NOT_ELIGIBLE_QUAL.degree, stream: NOT_ELIGIBLE_QUAL.stream, percentage: 55 + Math.floor(rng() * 15) }]
      : [{ degree: pickQual.degree, stream: pickQual.stream, percentage: 55 + Math.floor(rng() * 35) }];

    // 1-3 random preferences in random order
    const prefCount = 1 + Math.floor(rng() * 3);
    const prefs = [...vacancyIdPool].sort(() => rng() - 0.5).slice(0, prefCount);

    // Generate a unique roll number
    let rollNo = "";
    do {
      rollNo = `NSSB24${String(500 + Math.floor(rng() * 500)).padStart(3, "0")}`;
    } while (usedRolls.has(rollNo));
    usedRolls.add(rollNo);

    all.push({
      id: `cand-${String(i + 1).padStart(4, "0")}`,
      examId: EXAM_IDS.CSRE_2025,
      rollNo,
      name,
      category: cat,
      age: 21 + Math.floor(rng() * 14),
      qualifications: quals,
      writtenMarks: written,
      practicalMarks: practical,
      interviewMarks: interview,
      preferences: prefs,
      isPwD: rng() < 0.03,
    });
  }
  return all;
}

export function seedIfEmpty() {
  const examStore = useExamStore.getState();
  const vacStore = useVacancyStore.getState();
  const candStore = useCandidateStore.getState();
  const settingsStore = useSettingsStore.getState();

  if (examStore.exams.length === 0) {
    examStore.setAll(seedExams());
  }
  if (vacStore.vacancies.length === 0) {
    vacStore.setAll(seedVacancies());
  }
  if (candStore.candidates.length === 0) {
    candStore.setAll(seedCandidates());
  }
  if (!settingsStore.settings.examSettings.activeExamId) {
    settingsStore.setActiveExamId(EXAM_IDS.CSRE_2025);
  }

  if (typeof window !== "undefined") {
    const counts = {
      exams: useExamStore.getState().exams.length,
      vacancies: useVacancyStore.getState().vacancies.length,
      candidates: useCandidateStore.getState().candidates.length,
      activeExamId: useSettingsStore.getState().settings.examSettings.activeExamId,
    };
    // eslint-disable-next-line no-console
    console.info("[NSSB seed] loaded:", counts);
  }
}

export const SEED_IDS = { EXAM_IDS, VAC_IDS };
