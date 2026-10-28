"use client";

import {
  FileText,
  Briefcase,
  BarChart3,
  Users,
  FileCheck2,
  FileBarChart,
} from "lucide-react";
import { ReportCard } from "@/components/reports/report-card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div
        className="surface-elevated p-6"
        style={{
          borderRadius: "var(--radius-xl)",
          background:
            "linear-gradient(135deg, var(--bg-surface), oklch(0.65 0.17 230 / 0.04))",
        }}
      >
        <h2 className="text-display text-xl font-bold text-sky-700">System Reports</h2>
        <p className="text-sm text-[color:var(--text-secondary)] mt-1">
          Generate and download official PDF / Excel reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <ReportCard
          reportKey="merit-list"
          variant="indigo"
          icon={FileText}
          title="Merit List Report"
          description="Complete official merit standings of all candidates."
        />
        <ReportCard
          reportKey="vacancy"
          variant="amber"
          icon={Briefcase}
          title="Vacancy Report"
          description="Detailed breakdown of vacancies across all departments."
        />
        <ReportCard
          reportKey="dept-allocation"
          variant="rose"
          icon={BarChart3}
          title="Dept-wise Allocation"
          description="Candidates allocated to each department."
        />
        <ReportCard
          reportKey="eligibility"
          variant="emerald"
          icon={Users}
          title="Eligibility Report"
          description="Summary of eligible vs non-eligible candidates."
        />
        <ReportCard
          reportKey="allocation-results"
          variant="sky"
          icon={FileCheck2}
          title="Allocation Results"
          description="Final outcome of the automatic allocation process."
        />
        <ReportCard
          reportKey="complete"
          variant="indigo"
          icon={FileBarChart}
          title="Complete Report"
          description="Master report combining all recruitment phases."
        />
      </div>
    </div>
  );
}
