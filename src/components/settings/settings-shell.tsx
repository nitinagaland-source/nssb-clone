"use client";

import { useState } from "react";
import { User, Settings as Gear, Shield, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileForm } from "./profile-form";
import { ExamSettingsForm } from "./exam-settings-form";
import { AllocationPrefsForm } from "./allocation-prefs-form";
import { NotificationsForm } from "./notifications-form";

const TABS = [
  { id: "profile", label: "User Profile", icon: User },
  { id: "exam", label: "Exam Settings", icon: Gear },
  { id: "alloc", label: "Allocation Prefs", icon: Shield },
  { id: "notif", label: "Notifications", icon: Bell },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsShell() {
  const [tab, setTab] = useState<TabId>("profile");

  return (
    <div className="grid grid-cols-[240px_1fr] gap-8">
      <aside className="space-y-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "w-full relative flex items-center gap-3 h-11 px-3 rounded-xl text-sm font-medium transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                active
                  ? "bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm-3d"
                  : "text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-sunken)]"
              )}
            >
              {active && (
                <span
                  className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
                  style={{ background: "var(--grad-indigo)" }}
                />
              )}
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </aside>

      <section>
        {tab === "profile" && <ProfileForm />}
        {tab === "exam" && <ExamSettingsForm />}
        {tab === "alloc" && <AllocationPrefsForm />}
        {tab === "notif" && <NotificationsForm />}
      </section>
    </div>
  );
}
