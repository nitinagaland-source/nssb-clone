"use client";

import { useState } from "react";
import { ExamTable } from "@/components/exams/exam-table";
import { CreateExamModal } from "@/components/exams/create-exam-modal";
import { PageToolbar } from "@/components/common/page-toolbar";

export default function ExaminationsPage() {
  const [search, setSearch] = useState("");
  return (
    <div>
      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search examinations..."
        right={<CreateExamModal />}
      />
      <ExamTable search={search} />
    </div>
  );
}
