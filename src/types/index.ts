export type Category = "UR" | "ST" | "BT" | "OBC" | "EWS" | "Indigenous";

export const CATEGORIES: Category[] = ["UR", "ST", "BT", "OBC", "EWS", "Indigenous"];

export type ExamCategory =
  | "Staff Recruitment"
  | "Edu & Tech"
  | "Clerical & Allied"
  | "Technical"
  | "Others";

export type ExaminationStatus = "Upcoming" | "Active" | "Completed";

export interface Examination {
  id: string;
  name: string;
  code: string;
  year: number;
  description: string;
  status: ExaminationStatus;
  category: ExamCategory;
  shortLabel: string;
  createdAt: string;
}

export interface Qualification {
  id: string;
  degree: string;
  stream: string;
  minPercentage: number;
}

export type VacancyStatus = "Draft" | "Active" | "Closed";

export interface Vacancy {
  id: string;
  examId: string;
  vacancyCode: string;
  postName: string;
  department: string;
  totalSeats: number;
  categories: Category[];
  seatsByCategory: Partial<Record<Category, number>>;
  ageRequirement: string;
  qualifications: Qualification[];
  status: VacancyStatus;
  createdAt: string;
}

export interface CandidateQualification {
  degree: string;
  stream: string;
  percentage: number;
}

export interface Candidate {
  id: string;
  examId: string;
  rollNo: string;
  name: string;
  category: Category;
  age: number;
  qualifications: CandidateQualification[];
  writtenMarks: number;
  practicalMarks: number;
  interviewMarks: number;
  preferences: string[];
  isPwD?: boolean;
}

export interface MeritEntry {
  rank: number;
  candidateId: string;
  rollNo: string;
  name: string;
  category: Category;
  written: number;
  practical: number;
  interview: number;
  total: number;
  qualificationLabel: string;
  eligible: boolean;
  eligibilityReason?: string;
}

export type AllocationStatus = "Allocated" | "Waitlisted" | "Unallocated" | "Not Eligible";

export interface Allocation {
  id: string;
  examId: string;
  candidateId: string;
  rank: number;
  vacancyId: string | null;
  postName: string | null;
  department: string | null;
  status: AllocationStatus;
  reason?: string;
  allocatedAt: string;
}

export interface AllocationRun {
  id: string;
  examId: string;
  ranAt: string;
  totalCandidates: number;
  eligibleCount: number;
  allocatedCount: number;
  waitlistedCount: number;
  unallocatedCount: number;
  notEligibleCount: number;
}

export interface Settings {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  examSettings: {
    activeExamId: string;
    passingPercentage: number;
    maxWrittenMarks: number;
    maxPracticalMarks: number;
    maxInterviewMarks: number;
  };
  allocationPrefs: {
    strictMerit: boolean;
    respectReservation: boolean;
    respectPreferences: boolean;
    tieBreaker: "written" | "age" | "random";
  };
  notifications: {
    emailOnRun: boolean;
    emailOnPublish: boolean;
  };
}
