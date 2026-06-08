"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Lock, Save, UserCircle } from "lucide-react";
import { apiClient, ApiError } from "../lib/api";
import { type AuthUser } from "../lib/adminPermissions";

type ProfileForm = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirmPassword: string;
};

const EMPTY_FORM: ProfileForm = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  confirmPassword: "",
};

function profileToForm(user: AuthUser): ProfileForm {
  return {
    username: user.username ?? "",
    email: user.email ?? "",
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    password: "",
    confirmPassword: "",
  };
}

function passwordsValid(password: string, confirmPassword: string): string | null {
  if (!password && !confirmPassword) return null;
  if (!password.trim()) return "Enter a new password or leave both password fields empty.";
  if (password !== confirmPassword) return "Passwords do not match.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

type UserProfileProps = {
  isDark: boolean;
  currentUser: AuthUser;
  cardBg: string;
  textMuted: string;
  inputCls: string;
  divider: string;
  onUserUpdated: (user: AuthUser) => void;
};

export default function UserProfile({
  isDark,
  currentUser,
  cardBg,
  textMuted,
  inputCls,
  divider,
  onUserUpdated,
}: UserProfileProps) {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const label = isDark ? "text-slate-300 text-xs font-medium" : "text-slate-600 text-xs font-medium";
  const btnPrimary = isDark
    ? "bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-400 hover:to-sky-300 text-slate-950"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<{ user: AuthUser }>("auth/admin/me", { cache: "no-store" });
      setProfile(data.user);
      setForm(profileToForm(data.user));
    } catch (err) {
      setProfile(currentUser);
      setForm(profileToForm(currentUser));
      setError(err instanceof ApiError ? err.message : "Failed to load profile from server.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pwErr = passwordsValid(form.password, form.confirmPassword);
    if (pwErr) {
      setError(pwErr);
      setSuccess(null);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: Record<string, string> = {
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      };
      if (form.password.trim()) {
        payload.password = form.password;
      }
      const data = await apiClient.patch<{ user: AuthUser }>("auth/admin/me", payload);
      setProfile(data.user);
      setForm(profileToForm(data.user));
      onUserUpdated(data.user);
      setSuccess("Profile saved. Changes are synced with Django Admin.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  const displayUser = profile ?? currentUser;
  const roleLabel = displayUser.is_superuser ? "Superuser" : displayUser.is_staff ? "Staff" : "User";

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
          <UserCircle size={24} className={isDark ? "text-blue-400" : "text-blue-600"} />
        </div>
        <div>
          <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>My Profile</h2>
          <p className={`text-sm ${textMuted}`}>
            Update your account details. Changes apply to Django Admin immediately.
          </p>
        </div>
      </motion.div>

      {error && (
        <div
          role="alert"
          className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-sm ${
            isDark ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-sm ${
            isDark ? "bg-sky-500/10 border-sky-500/30 text-sky-300" : "bg-sky-50 border-sky-200 text-sky-800"
          }`}
        >
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          {success}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-5 sm:p-6 ${cardBg}`}
      >
        <div className={`text-xs font-semibold uppercase tracking-wide mb-4 ${textMuted}`}>Account</div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className={label}>User ID</dt>
            <dd className={isDark ? "text-slate-100 mt-0.5" : "text-slate-900 mt-0.5"}>{displayUser.id}</dd>
          </div>
          <div>
            <dt className={label}>Role</dt>
            <dd className={isDark ? "text-slate-100 mt-0.5" : "text-slate-900 mt-0.5"}>{roleLabel}</dd>
          </div>
          <div>
            <dt className={label}>Account status</dt>
            <dd className={isDark ? "text-slate-100 mt-0.5" : "text-slate-900 mt-0.5"}>
              {displayUser.is_active === false ? "Inactive" : "Active"}
            </dd>
          </div>
          <div>
            <dt className={label}>Date joined</dt>
            <dd className={isDark ? "text-slate-100 mt-0.5" : "text-slate-900 mt-0.5"}>
              {formatDateTime(displayUser.date_joined)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className={label}>Last login</dt>
            <dd className={isDark ? "text-slate-100 mt-0.5" : "text-slate-900 mt-0.5"}>
              {formatDateTime(displayUser.last_login)}
            </dd>
          </div>
        </dl>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={(e) => void handleSubmit(e)}
        className={`rounded-2xl border p-5 sm:p-6 space-y-5 ${cardBg}`}
      >
        <div className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>Personal information</div>

        {loading ? (
          <div className={`text-sm ${textMuted}`}>Loading profile…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-username" className={label}>
                  Username
                </label>
                <input
                  id="profile-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className={`mt-1 w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputCls}`}
                />
              </div>
              <div>
                <label htmlFor="profile-email" className={label}>
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={`mt-1 w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputCls}`}
                />
              </div>
              <div>
                <label htmlFor="profile-first-name" className={label}>
                  First name
                </label>
                <input
                  id="profile-first-name"
                  type="text"
                  autoComplete="given-name"
                  value={form.first_name}
                  onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                  className={`mt-1 w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputCls}`}
                />
              </div>
              <div>
                <label htmlFor="profile-last-name" className={label}>
                  Last name
                </label>
                <input
                  id="profile-last-name"
                  type="text"
                  autoComplete="family-name"
                  value={form.last_name}
                  onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                  className={`mt-1 w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputCls}`}
                />
              </div>
            </div>

            <div className={`border-t pt-5 ${divider}`}>
              <div className={`flex items-center gap-2 mb-3 ${textMuted}`}>
                <Lock size={14} />
                <span className="text-xs font-semibold uppercase tracking-wide">Change password</span>
              </div>
              <p className={`text-xs mb-4 ${textMuted}`}>Leave blank to keep your current password.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-password" className={label}>
                    New password
                  </label>
                  <input
                    id="profile-password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className={`mt-1 w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputCls}`}
                  />
                </div>
                <div>
                  <label htmlFor="profile-confirm-password" className={label}>
                    Confirm new password
                  </label>
                  <input
                    id="profile-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    className={`mt-1 w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputCls}`}
                  />
                </div>
              </div>
              {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                <p className={`mt-2 text-xs ${isDark ? "text-red-400" : "text-red-600"}`}>Passwords do not match.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || loading}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${btnPrimary}`}
              >
                <Save size={16} />
                {saving ? "Saving…" : "Save profile"}
              </button>
              <button
                type="button"
                disabled={saving || loading}
                onClick={() => void loadProfile()}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  isDark
                    ? "bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Reset
              </button>
            </div>
          </>
        )}
      </motion.form>
    </div>
  );
}
