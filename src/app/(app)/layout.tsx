import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { SeedBoot } from "@/components/shell/seed-boot";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SeedBoot />
      <Sidebar />
      <div className="pl-60">
        <Topbar />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
