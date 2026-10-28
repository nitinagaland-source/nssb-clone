"use client";

import { useMemo } from "react";
import { Briefcase, Users, UserCheck, UserPlus, UserMinus } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { DeptBars } from "@/components/dashboard/dept-bars";
import { RecentAllocations } from "@/components/dashboard/recent-allocations";
import { useVacancyStore } from "@/store/vacancy-store";
import { useCandidateStore } from "@/store/candidate-store";
import { useAllocationStore } from "@/store/allocation-store";
import { useSettingsStore } from "@/store/settings-store";
import { computeMerit } from "@/lib/merit";

export default function DashboardPage() {
  const vacancies = useVacancyStore((s) => s.vacancies);
  const candidates = useCandidateStore((s) => s.candidates);
  const allocations = useAllocationStore((s) => s.allocations);
  const settings = useSettingsStore((s) => s.settings);
  const activeExamId = settings.examSettings.activeExamId;

  const stats = useMemo(() => {
    const vacs = vacancies.filter((v) => v.examId === activeExamId);
    const cands = candidates.filter((c) => c.examId === activeExamId);
    const totalVacancies = vacs.reduce((n, v) => n + v.totalSeats, 0);
    const totalCandidates = cands.length;
    const merit = computeMerit(candidates, vacancies, settings);
    const eligible = merit.filter((m) => m.eligible).length;
    const examAllocs = allocations.filter((a) => a.examId === activeExamId);
    const allocated = examAllocs.filter((a) => a.status === "Allocated").length;
    const unallocated =
      examAllocs.filter((a) => a.status === "Unallocated" || a.status === "Waitlisted").length;
    return {
      totalVacancies,
      totalCandidates,
      eligible,
      allocated,
      unallocated,
      eligiblePct: totalCandidates ? Math.round((eligible / totalCandidates) * 1000) / 10 : 0,
      fulfillmentPct: totalVacancies ? Math.round((allocated / totalVacancies) * 100) : 0,
    };
  }, [vacancies, candidates, allocations, settings, activeExamId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          label="Total Vacancies"
          value={stats.totalVacancies}
          trend="+12% from last year"
          icon={Briefcase}
          gradientClass="grad-sky"
          glowClass="shadow-glow-sky"
          href="/vacancies"
          delay={0.0}
        />
        <StatCard
          label="Total Candidates"
          value={stats.totalCandidates}
          subtitle="14 exam centers"
          icon={Users}
          gradientClass="grad-amber"
          glowClass="shadow-glow-amber"
          href="/candidates"
          delay={0.06}
        />
        <StatCard
          label="Eligible"
          value={stats.eligible}
          subtitle={`${stats.eligiblePct}% of total`}
          icon={UserCheck}
          gradientClass="grad-emerald"
          glowClass="shadow-glow-emerald"
          href="/merit-list"
          delay={0.12}
        />
        <StatCard
          label="Allocated"
          value={stats.allocated}
          subtitle={`${stats.fulfillmentPct}% fulfillment`}
          icon={UserPlus}
          gradientClass="grad-emerald"
          glowClass="shadow-glow-emerald"
          href="/results"
          delay={0.18}
        />
        <StatCard
          label="Unallocated"
          value={stats.unallocated}
          subtitle="Pending 2nd phase"
          icon={UserMinus}
          gradientClass="grad-rose"
          glowClass="shadow-glow-rose"
          href="/allocation"
          delay={0.24}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <DeptBars />
        <RecentAllocations />
      </div>
    </div>
  );
}
