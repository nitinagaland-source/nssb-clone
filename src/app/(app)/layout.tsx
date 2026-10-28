import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { SeedBoot } from "@/components/shell/seed-boot";
import { AuthGuard } from "@/components/shell/auth-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <SeedBoot />
        <Sidebar />
        <div className="pl-60">
          <Topbar />
          <main className="p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
