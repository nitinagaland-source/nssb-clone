"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { VacancyTable } from "@/components/vacancies/vacancy-table";
import { VacancyModal } from "@/components/vacancies/vacancy-modal";
import { PageToolbar } from "@/components/common/page-toolbar";
import { GradientButton } from "@/components/common/gradient-button";
import type { Vacancy } from "@/types";

export default function VacanciesPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vacancy | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (v: Vacancy) => {
    setEditing(v);
    setModalOpen(true);
  };

  return (
    <div>
      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search vacancies..."
        right={
          <GradientButton onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Vacancy
          </GradientButton>
        }
      />
      <VacancyTable search={search} onEdit={openEdit} />
      {modalOpen && (
        <VacancyModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} />
      )}
    </div>
  );
}
