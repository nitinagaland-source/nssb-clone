import { CardsSkeleton, TableSkeleton } from "@/components/common/table-skeleton";
export default function Loading() {
  return (
    <div className="space-y-6">
      <CardsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <TableSkeleton rows={6} />
        <TableSkeleton rows={5} />
      </div>
    </div>
  );
}
