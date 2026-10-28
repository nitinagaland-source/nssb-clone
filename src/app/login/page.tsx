"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail, LogIn, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore, ADMIN_EMAIL, ADMIN_PASSWORD } from "@/store/auth-store";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const isAuthed = useAuthStore((s) => s.isAuthed);
  const [mounted, setMounted] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && isAuthed) router.replace("/dashboard");
  }, [mounted, isAuthed, router]);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit((values) => {
    const result = signIn(values.email, values.password);
    if (!result.ok) {
      form.setError("password", { message: result.message });
      return;
    }
    toast.success("Signed in");
    router.replace("/dashboard");
  });

  const prefill = () => {
    form.setValue("email", ADMIN_EMAIL);
    form.setValue("password", ADMIN_PASSWORD);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated gradient background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 10% 10%, oklch(0.65 0.22 275 / 0.18), transparent 60%), radial-gradient(1000px 500px at 90% 90%, oklch(0.7 0.18 180 / 0.14), transparent 60%), var(--bg-page)",
        }}
      />

      <div
        className="w-full max-w-md surface-elevated p-8"
        style={{ borderRadius: "var(--radius-xl)" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="h-12 w-12 rounded-xl grad-indigo shadow-glow-indigo text-white flex items-center justify-center"
          >
            <span className="text-display text-[11px] leading-tight font-bold text-center">
              STAFF
              <br />
              SEL
            </span>
          </div>
          <div className="leading-tight">
            <div className="text-display text-xl font-bold">NSSB</div>
            <div className="text-xs text-[color:var(--text-muted)]">Govt. of Nagaland</div>
          </div>
        </div>

        <h1 className="text-display text-2xl font-bold text-[color:var(--text-primary)]">
          Sign in to continue
        </h1>
        <p className="text-sm text-[color:var(--text-secondary)] mt-1">
          Admin console for recruitment & merit allocation.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[color:var(--text-secondary)] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-muted)]" />
              <input
                {...form.register("email")}
                type="email"
                placeholder="admin@gmail.com"
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border)] text-sm text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>
            {form.formState.errors.email && (
              <div className="mt-1 text-xs text-rose-600">
                {form.formState.errors.email.message}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[color:var(--text-secondary)] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-muted)]" />
              <input
                {...form.register("password")}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border)] text-sm text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] inline-flex items-center justify-center"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <div className="mt-1 text-xs text-rose-600">
                {form.formState.errors.password.message}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl grad-indigo shadow-glow-indigo text-white font-semibold text-sm hover:-translate-y-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
        </form>

        <button
          type="button"
          onClick={prefill}
          className="mt-4 w-full text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)] text-center"
        >
          Use demo credentials ({ADMIN_EMAIL} / {ADMIN_PASSWORD})
        </button>
      </div>
    </div>
  );
}
