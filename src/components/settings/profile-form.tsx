"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/settings-store";
import { SettingsCard, Field } from "./settings-card";

const ADMIN_DEMO_PASSWORD = "admin@123";

const schema = z
  .object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (v) => {
      if (!v.newPassword && !v.confirmPassword && !v.currentPassword) return true;
      if (!v.currentPassword) return false;
      return v.currentPassword === ADMIN_DEMO_PASSWORD;
    },
    { message: "Current password is incorrect (demo: admin@123)", path: ["currentPassword"] }
  )
  .refine(
    (v) => {
      if (!v.newPassword) return true;
      return v.newPassword.length >= 8;
    },
    { message: "New password must be at least 8 characters", path: ["newPassword"] }
  )
  .refine(
    (v) => {
      if (!v.newPassword) return true;
      return v.newPassword === v.confirmPassword;
    },
    { message: "Passwords do not match", path: ["confirmPassword"] }
  );

type Values = z.infer<typeof schema>;

export function ProfileForm() {
  const user = useSettingsStore((s) => s.settings.user);
  const updateUser = useSettingsStore((s) => s.updateUser);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.firstName, user.lastName, user.email]);

  const onSubmit = form.handleSubmit((values) => {
    updateUser({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
    });
    toast.success(values.newPassword ? "Profile and password updated" : "Profile updated");
    form.reset({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-0">
      <SettingsCard
        title="User Profile"
        onSave={onSubmit}
        onCancel={() => form.reset()}
        dirty={form.formState.isDirty}
        saveLabel="Save Changes"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" error={form.formState.errors.firstName?.message}>
              <input {...form.register("firstName")} className="input-base" />
            </Field>
            <Field label="Last Name" error={form.formState.errors.lastName?.message}>
              <input {...form.register("lastName")} className="input-base" />
            </Field>
          </div>
          <Field label="Email Address" error={form.formState.errors.email?.message}>
            <input type="email" {...form.register("email")} className="input-base" />
          </Field>
          <Field label="Role" readOnly>
            <input
              value={user.role}
              readOnly
              className="input-base bg-[color:var(--bg-sunken)]"
            />
          </Field>

          <div className="pt-2 border-t border-[color:var(--border)]">
            <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mt-4 mb-3">
              Change Password
            </div>
            <Field
              label="Current Password"
              error={form.formState.errors.currentPassword?.message}
            >
              <input
                type="password"
                {...form.register("currentPassword")}
                className="input-base"
                placeholder="Enter current password"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="New Password" error={form.formState.errors.newPassword?.message}>
                <input
                  type="password"
                  {...form.register("newPassword")}
                  className="input-base"
                  placeholder="Enter new password"
                />
              </Field>
              <Field
                label="Confirm Password"
                error={form.formState.errors.confirmPassword?.message}
              >
                <input
                  type="password"
                  {...form.register("confirmPassword")}
                  className="input-base"
                  placeholder="Confirm new password"
                />
              </Field>
            </div>
            <Save className="hidden" />
          </div>
        </div>
      </SettingsCard>
      <style jsx>{`
        .input-base {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border-radius: 10px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
        }
        .input-base:focus-visible {
          border-color: var(--ring);
        }
      `}</style>
    </form>
  );
}
