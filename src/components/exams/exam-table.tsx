"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Copy, Pencil, Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/common/status-chip";
import { useExamStore } from "@/store/exam-store";
import { useVacancyStore } from "@/store/vacancy-store";
import { useCandidateStore } from "@/store/candidate-store";
import { useSettingsStore } from "@/store/settings-store";
import type { Examination } from "@/types";
import { nanoid } from "nanoid";

export function ExamTable({ search }: { search: string }) {
  const router = useRouter();
  const exams = useExamStore((s) => s.exams);
  const addExam = useExamStore((s) => s.add);
  const removeExam = useExamStore((s) => s.remove);
  const updateExam = useExamStore((s) => s.update);
  const vacancies = useVacancyStore((s) => s.vacancies);
  const candidates = useCandidateStore((s) => s.candidates);
  const setActiveExamId = useSettingsStore((s) => s.setActiveExamId);
  const [toDelete, setToDelete] = useState<Examination | null>(null);

  const counts = useMemo(() => {
    const vacMap = new Map<string, number>();
    for (const v of vacancies) {
      vacMap.set(v.examId, (vacMap.get(v.examId) ?? 0) + v.totalSeats);
    }
    const candMap = new Map<string, number>();
    for (const c of candidates) {
      candMap.set(c.examId, (candMap.get(c.examId) ?? 0) + 1);
    }
    return { vacMap, candMap };
  }, [vacancies, candidates]);

  const data = useMemo(() => {
    return [...exams].sort((a, b) => b.year - a.year);
  }, [exams]);

  const fuzzy: FilterFn<Examination> = (row, _col, value) => {
    const needle = String(value).toLowerCase();
    const e = row.original;
    return (
      e.code.toLowerCase().includes(needle) ||
      e.name.toLowerCase().includes(needle) ||
      String(e.year).includes(needle)
    );
  };

  const columns = useMemo<ColumnDef<Examination>[]>(
    () => [
      {
        header: "Exam Code",
        accessorKey: "code",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => {
              setActiveExamId(row.original.id);
              toast.success(`Switched to ${row.original.shortLabel}`);
            }}
            className="text-mono text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
          >
            {row.original.code}
          </button>
        ),
      },
      {
        header: "Examination Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="text-sm text-[color:var(--text-primary)] font-medium max-w-[380px] truncate">
            {row.original.name}
          </div>
        ),
      },
      {
        header: "Year",
        accessorKey: "year",
        cell: ({ row }) => (
          <div className="text-sm text-[color:var(--text-secondary)]">{row.original.year}</div>
        ),
      },
      {
        header: "Vacancies",
        id: "vacancies",
        cell: ({ row }) => (
          <div className="text-sm font-semibold text-[color:var(--text-primary)]">
            {(counts.vacMap.get(row.original.id) ?? 0).toLocaleString()}
          </div>
        ),
      },
      {
        header: "Candidates",
        id: "candidates",
        cell: ({ row }) => (
          <div className="text-sm font-semibold text-[color:var(--text-primary)]">
            {(counts.candMap.get(row.original.id) ?? 0).toLocaleString()}
          </div>
        ),
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
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 rounded-lg hover:bg-[color:var(--bg-sunken)] inline-flex items-center justify-center text-[color:var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg-3d">
              <DropdownMenuItem
                onSelect={() => {
                  const next = prompt("Edit name", row.original.name);
                  if (next && next.trim()) {
                    updateExam(row.original.id, { name: next.trim() });
                    toast.success("Examination updated");
                  }
                }}
              >
                <Pencil className="h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  const e = row.original;
                  addExam({
                    ...e,
                    id: `exam-${nanoid(10)}`,
                    name: `${e.name} (Copy)`,
                    code: `${e.code}-COPY`,
                    status: "Upcoming",
                    createdAt: new Date().toISOString(),
                  });
                  toast.success("Examination duplicated");
                }}
              >
                <Copy className="h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  updateExam(row.original.id, { status: "Completed" });
                  toast.success("Examination archived");
                }}
              >
                <Archive className="h-4 w-4" /> Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setToDelete(row.original)}
                className="text-rose-600 focus:text-rose-700"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [counts, setActiveExamId, addExam, updateExam]
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter: search },
    onGlobalFilterChange: () => {},
    globalFilterFn: fuzzy,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-[color:var(--text-muted)]">
                    No examinations match your search.
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
            <DialogTitle className="text-display text-lg font-bold">Delete examination?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[color:var(--text-secondary)]">
            This permanently removes <span className="font-semibold">{toDelete?.code}</span>. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!toDelete) return;
                removeExam(toDelete.id);
                toast.success("Examination deleted");
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
