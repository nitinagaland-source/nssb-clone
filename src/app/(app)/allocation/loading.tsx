import { TableSkeleton } from "@/components/common/table-skeleton";
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full max-w-md rounded-xl bg-[color:var(--bg-sunken)] animate-pulse" />
      <TableSkeleton rows={10} />
    </div>
  );
}
