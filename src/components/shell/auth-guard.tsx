"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthed = useAuthStore((s) => s.isAuthed);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait for persist to rehydrate on first mount, then check
    if (!isAuthed) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [isAuthed, router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
