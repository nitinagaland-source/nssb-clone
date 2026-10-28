"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/common/status-chip";
import { useVacancyStore } from "@/store/vacancy-store";
import { useSettingsStore } from "@/store/settings-store";
import type { Vacancy } from "@/types";

export function VacancyTable({
  search,
  onEdit,
}: {
  search: string;
  onEdit: (v: Vacancy) => void;
}) {
  const vacancies = useVacancyStore((s) => s.vacancies);
  const removeVac = useVacancyStore((s) => s.remove);
  const activeExamId = useSettingsStore((s) => s.settings.examSettings.activeExamId);
  const [toDelete, setToDelete] = useState<Vacancy | null>(null);

  const data = useMemo(
    () =>
      vacancies
        .filter((v) => v.examId === activeExamId)
        .sort((a, b) => a.vacancyCode.localeCompare(b.vacancyCode)),
    [vacancies, activeExamId]
  );

  const fuzzy: FilterFn<Vacancy> = (row, _col, value) => {
    const n = String(value).toLowerCase();
    const v = row.original;
    return (
      v.vacancyCode.toLowerCase().includes(n) ||
      v.postName.toLowerCase().includes(n) ||
      v.department.toLowerCase().includes(n)
    );
  };

  const columns = useMemo<ColumnDef<Vacancy>[]>(
    () => [
      {
        header: "Vacancy ID",
        accessorKey: "vacancyCode",
        cell: ({ row }) => (
          <span className="text-mono text-indigo-600 font-semibold text-sm">
            {row.original.vacancyCode}
          </span>
        ),
      },
      {
        header: "Post Name",
        accessorKey: "postName",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-[color:var(--text-primary)]">
            {row.original.postName}
          </div>
        ),
      },
      {
        header: "Department",
        accessorKey: "department",
        cell: ({ row }) => (
          <div className="text-sm text-[color:var(--text-secondary)]">
            {row.original.department}
          </div>
        ),
      },
      {
        header: "Vacancies",
        accessorKey: "totalSeats",
        cell: ({ row }) => (
          <div
            className={`text-sm font-bold ${
              row.original.status === "Active"
                ? "text-emerald-600"
                : "text-[color:var(--text-muted)]"
            }`}
          >
            {row.original.totalSeats}
          </div>
        ),
      },
      {
        header: "Category",
        id: "categories",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.categories.map((c) => (
              <span
                key={c}
                className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {c}
              </span>
            ))}
          </div>
        ),
      },
      {
        header: "Qualification",
        id: "qualification",
        cell: ({ row }) => {
          const q = row.original.qualifications[0];
          const extra = row.original.qualifications.length - 1;
          return (
            <div className="text-sm text-[color:var(--text-secondary)] max-w-[260px]">
              {q ? `${q.degree} — ${q.stream}` : "—"}
              {extra > 0 && (
                <span className="ml-1 text-[color:var(--text-muted)]">+{extra} more</span>
              )}
            </div>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => <StatusChip status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => onEdit(row.original)}
              className="h-8 w-8 rounded-lg text-[color:var(--text-muted)] hover:text-indigo-700 hover:bg-indigo-50 inline-flex items-center justify-center"
              aria-label="Edit vacancy"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setToDelete(row.original)}
              className="h-8 w-8 rounded-lg text-[color:var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 inline-flex items-center justify-center"
              aria-label="Delete vacancy"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter: search },
    onGlobalFilterChange: () => {},
    globalFilterFn: fuzzy,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      <div className="surface-elevated overflow-hidden" style={{ borderRadius: "var(--radius-xl)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[color:var(--border)]">
              {table.getHeaderGroups()[0].headers.map((h) => (
                <th
                  key={h.id}
                  className="text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--text-muted)] px-4 py-3"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-14 text-center text-sm text-[color:var(--text-muted)]"
                  >
                    No vacancies in the active exam yet. Click <strong>+ Add Vacancy</strong>.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--bg-sunken)]/60 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <Dialog open={toDelete != null} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-display text-lg font-bold">Delete vacancy?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[color:var(--text-secondary)]">
            This permanently removes <span className="font-semibold">{toDelete?.vacancyCode}</span>{" "}
            — {toDelete?.postName}.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!toDelete) return;
                removeVac(toDelete.id);
                toast.success("Vacancy deleted");
                setToDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
