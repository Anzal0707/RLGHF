"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  Search,
  Shield,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { apiClient, ApiError } from "../lib/api";
import { type AuthUser, hasPerm, PERMS } from "../lib/adminPermissions";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface AdminUserRow {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  user_permissions: number[];
  permission_labels: string[];
  date_joined: string;
  last_login: string | null;
}

interface AdminPermissionRow {
  id: number;
  codename: string;
  name: string;
  app_label: string;
}

type UserManagementProps = {
  isDark: boolean;
  currentUser: AuthUser;
  cardBg: string;
  textMuted: string;
  inputCls: string;
  divider: string;
  tHead: string;
  tableHover: string;
};

const EMPTY_FORM = {
  username: "",
  password: "",
  confirmPassword: "",
  is_active: true,
  is_staff: true,
  user_permissions: [] as number[],
};

function passwordsValid(password: string, confirmPassword: string, required: boolean): string | null {
  if (!required && !password && !confirmPassword) return null;
  if (required && !password.trim()) return "Password is required.";
  if (password !== confirmPassword) return "Passwords do not match.";
  if (password.length > 0 && password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

function PermissionPicker({
  permissions,
  selected,
  onChange,
  isDark,
  textMuted,
  inputCls,
  divider,
  disabled,
}: {
  permissions: AdminPermissionRow[];
  selected: number[];
  onChange: (ids: number[]) => void;
  isDark: boolean;
  textMuted: string;
  inputCls: string;
  divider: string;
  disabled?: boolean;
}) {
  const [filter, setFilter] = useState("");

  const grouped = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = permissions.filter((p) => {
      if (!q) return true;
      const label = `${p.app_label}.${p.codename} ${p.name}`.toLowerCase();
      return label.includes(q);
    });
    const map = new Map<string, AdminPermissionRow[]>();
    for (const p of filtered) {
      const list = map.get(p.app_label) ?? [];
      list.push(p);
      map.set(p.app_label, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [permissions, filter]);

  function toggle(id: number, checked: boolean) {
    if (disabled) return;
    onChange(checked ? [...selected, id] : selected.filter((x) => x !== id));
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter permissions…"
          disabled={disabled}
          className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none ${inputCls}`}
        />
      </div>
      <div
        className={`max-h-56 overflow-y-auto rounded-xl border p-2 space-y-3 ${
          isDark ? "border-slate-700" : "border-slate-200"
        }`}
      >
        {grouped.length === 0 && (
          <p className={`text-xs text-center py-4 ${textMuted}`}>No permissions match your filter.</p>
        )}
        {grouped.map(([app, perms]) => (
          <div key={app}>
            <div className={`text-[10px] font-bold uppercase tracking-wider px-1 mb-1 ${textMuted}`}>
              {app}
            </div>
            <div className={`space-y-1 border-t pt-1 ${divider}`}>
              {perms.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-start gap-2 text-xs rounded-lg px-1 py-0.5 ${
                    disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                  } ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 shrink-0"
                    checked={selected.includes(p.id)}
                    disabled={disabled}
                    onChange={(e) => toggle(p.id, e.target.checked)}
                  />
                  <span className="min-w-0">
                    <span className="font-mono">{p.codename}</span>
                    <span className={` block ${textMuted}`}>{p.name}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className={`text-[11px] ${textMuted}`}>
        {selected.length} permission{selected.length !== 1 ? "s" : ""} selected
      </p>
    </div>
  );
}

export default function UserManagement({
  isDark,
  currentUser,
  cardBg,
  textMuted,
  inputCls,
  divider,
  tHead,
  tableHover,
}: UserManagementProps) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [permissions, setPermissions] = useState<AdminPermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [listSearch, setListSearch] = useState("");

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUserRow | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const canAddUser = hasPerm(currentUser, PERMS.addUser);
  const canChangeUser = hasPerm(currentUser, PERMS.changeUser);
  const canDeleteUser = hasPerm(currentUser, PERMS.deleteUser);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, permsRes] = await Promise.all([
        apiClient.get<PaginatedResponse<AdminUserRow> | AdminUserRow[]>("auth/admin/users", {
          params: { page_size: 200 },
          cache: "no-store",
        }),
        apiClient.get<PaginatedResponse<AdminPermissionRow> | AdminPermissionRow[]>(
          "auth/admin/permissions",
          { params: { page_size: 500 }, cache: "no-store" },
        ),
      ]);
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes.results ?? []);
      setPermissions(Array.isArray(permsRes) ? permsRes : permsRes.results ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load user management data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!success) return;
    const t = window.setTimeout(() => setSuccess(null), 4000);
    return () => window.clearTimeout(t);
  }, [success]);

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

  const filteredUsers = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const haystack = [u.username, u.email, ...u.permission_labels].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [users, listSearch]);

  useEffect(() => {
    if (selectedUser) {
      setForm({
        username: selectedUser.username,
        password: "",
        confirmPassword: "",
        is_active: selectedUser.is_active,
        is_staff: selectedUser.is_staff,
        user_permissions: [...selectedUser.user_permissions],
      });
      setShowCreateUser(false);
    }
  }, [selectedUser]);

  function openCreate() {
    setShowCreateUser(true);
    setSelectedUserId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function validatePasswords(required: boolean): string | null {
    return passwordsValid(form.password, form.confirmPassword, required);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!canAddUser) return;
    const pwErr = validatePasswords(true);
    if (pwErr) {
      setError(pwErr);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await apiClient.post("auth/admin/users", {
        username: form.username.trim(),
        password: form.password,
        is_active: form.is_active,
        is_staff: form.is_staff,
        user_permissions: form.user_permissions,
      });
      setSuccess("User created successfully.");
      setShowCreateUser(false);
      setForm(EMPTY_FORM);
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !canChangeUser) return;
    const pwErr = validatePasswords(false);
    if (pwErr) {
      setError(pwErr);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: Record<string, unknown> = {
        is_active: form.is_active,
        is_staff: form.is_staff,
        user_permissions: form.user_permissions,
      };
      if (form.password.trim()) payload.password = form.password;
      await apiClient.patch(`auth/admin/users/${selectedUser.id}`, payload);
      setSuccess("User permissions updated.");
      setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser() {
    if (!deleteConfirmUser || !canDeleteUser) return;
    if (deleteConfirmUser.id === currentUser.id) {
      setError("You cannot delete your own account.");
      setDeleteConfirmUser(null);
      return;
    }
    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      await apiClient.delete(`auth/admin/users/${deleteConfirmUser.id}`);
      setSuccess(`User "${deleteConfirmUser.username}" deleted.`);
      if (selectedUserId === deleteConfirmUser.id) {
        setSelectedUserId(null);
        setForm(EMPTY_FORM);
      }
      setDeleteConfirmUser(null);
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete user.");
      setDeleteConfirmUser(null);
    } finally {
      setDeleting(false);
    }
  }

  const btnPrimary = isDark
    ? "bg-gradient-to-r from-blue-500 to-sky-400 text-slate-950 hover:from-blue-400 hover:to-sky-300"
    : "bg-blue-600 text-white hover:bg-blue-700";

  const btnDanger = isDark
    ? "bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/20"
    : "bg-red-600 text-white hover:bg-red-700";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield size={18} className={isDark ? "text-blue-400" : "text-blue-600"} />
          <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            User Management
          </h2>
        </div>
        {canAddUser && (
          <button
            type="button"
            onClick={openCreate}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${btnPrimary}`}
          >
            <UserPlus size={14} /> Create User
          </button>
        )}
      </div>

      {error && (
        <div
          className={`flex items-center gap-2 text-sm rounded-xl px-3 py-2.5 border ${
            isDark ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div
          className={`flex items-center gap-2 text-sm rounded-xl px-3 py-2.5 border ${
            isDark
              ? "bg-sky-500/10 border-sky-500/20 text-sky-400"
              : "bg-sky-50 border-sky-200 text-sky-700"
          }`}
        >
          <CheckCircle2 size={14} className="shrink-0" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* User list */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`xl:col-span-3 rounded-2xl border overflow-hidden ${cardBg}`}
        >
          <div className={`px-5 py-4 border-b ${divider} space-y-3`}>
            <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Users ({filteredUsers.length})
            </div>
            <div className="relative">
              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
              <input
                type="text"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Search users or permissions…"
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none ${inputCls}`}
              />
            </div>
          </div>
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className={`sticky top-0 z-10 ${tHead}`}>
                <tr>
                  {["Username", "Permissions", "Staff", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${divider}`}>
                {loading ? (
                  <tr>
                    <td colSpan={4} className={`px-4 py-10 text-center ${textMuted}`}>
                      Loading users…
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={`px-4 py-10 text-center ${textMuted}`}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className={`${tableHover} transition-colors ${
                        selectedUserId === u.id
                          ? isDark
                            ? "bg-slate-800/80"
                            : "bg-blue-50/80"
                          : ""
                      }`}
                    >
                      <td className={`px-4 py-3 font-medium whitespace-nowrap ${isDark ? "text-white" : "text-slate-900"}`}>
                        {u.username}
                        {u.is_superuser && (
                          <span
                            className={`ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            Super
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-xs max-w-[220px] ${textMuted}`}>
                        {u.is_superuser ? (
                          "All permissions"
                        ) : u.permission_labels.length === 0 ? (
                          "—"
                        ) : (
                          <span title={u.permission_labels.join(", ")}>
                            {u.permission_labels.length} perm
                            {u.permission_labels.length !== 1 ? "s" : ""}:{" "}
                            {u.permission_labels.slice(0, 2).join(", ")}
                            {u.permission_labels.length > 2 ? "…" : ""}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-xs ${textMuted}`}>{u.is_staff ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            u.is_active
                              ? isDark
                                ? "bg-sky-500/15 text-sky-300"
                                : "bg-sky-50 text-sky-700"
                              : isDark
                                ? "bg-slate-700 text-slate-400"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Detail / create panel */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`xl:col-span-2 rounded-2xl border p-5 ${cardBg}`}
        >
          {showCreateUser && canAddUser ? (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                Create User
              </div>
              <input
                required
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${inputCls}`}
                autoComplete="off"
              />
              <input
                required
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${inputCls}`}
                autoComplete="new-password"
              />
              <input
                required
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${inputCls}`}
                autoComplete="new-password"
              />
              {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                <p className={`text-xs ${isDark ? "text-red-400" : "text-red-600"}`}>
                  Passwords do not match
                </p>
              )}
              <label className={`flex items-center gap-2 text-sm ${textMuted}`}>
                <input
                  type="checkbox"
                  checked={form.is_staff}
                  onChange={(e) => setForm((f) => ({ ...f, is_staff: e.target.checked }))}
                />
                Staff access (required for admin dashboard)
              </label>
              <label className={`flex items-center gap-2 text-sm ${textMuted}`}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                Active
              </label>
              <div>
                <div className={`text-xs font-semibold uppercase mb-2 ${textMuted}`}>Django Permissions</div>
                <PermissionPicker
                  permissions={permissions}
                  selected={form.user_permissions}
                  onChange={(ids) => setForm((f) => ({ ...f, user_permissions: ids }))}
                  isDark={isDark}
                  textMuted={textMuted}
                  inputCls={inputCls}
                  divider={divider}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateUser(false);
                    setForm(EMPTY_FORM);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${
                    isDark
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || form.password !== form.confirmPassword}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 ${btnPrimary}`}
                >
                  {saving ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
          ) : selectedUser && canChangeUser ? (
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {selectedUser.username}
                  </div>
                  <div className={`text-xs ${textMuted}`}>
                    Joined {new Date(selectedUser.date_joined).toLocaleDateString()}
                  </div>
                </div>
                {canDeleteUser && selectedUser.id !== currentUser.id && (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmUser(selectedUser)}
                    className={`p-2 rounded-lg transition-colors ${btnDanger}`}
                    title="Delete user"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {selectedUser.is_superuser ? (
                <p className={`text-sm rounded-xl px-3 py-2.5 border ${isDark ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                  Superusers have all permissions. Direct permission edits are not applicable.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`flex items-center gap-2 text-sm ${textMuted}`}>
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                      />
                      Active
                    </label>
                    <label className={`flex items-center gap-2 text-sm ${textMuted}`}>
                      <input
                        type="checkbox"
                        checked={form.is_staff}
                        onChange={(e) => setForm((f) => ({ ...f, is_staff: e.target.checked }))}
                      />
                      Staff
                    </label>
                  </div>
                  <div>
                    <div className={`text-xs font-semibold uppercase mb-2 ${textMuted}`}>
                      Reset Password (optional)
                    </div>
                    <input
                      type="password"
                      placeholder="New password"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-xl border text-sm outline-none mb-2 ${inputCls}`}
                      autoComplete="new-password"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${inputCls}`}
                      autoComplete="new-password"
                    />
                    {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className={`text-xs mt-1 ${isDark ? "text-red-400" : "text-red-600"}`}>
                        Passwords do not match
                      </p>
                    )}
                  </div>
                  <div>
                    <div className={`text-xs font-semibold uppercase mb-2 ${textMuted}`}>Django Permissions</div>
                    <PermissionPicker
                      permissions={permissions}
                      selected={form.user_permissions}
                      onChange={(ids) => setForm((f) => ({ ...f, user_permissions: ids }))}
                      isDark={isDark}
                      textMuted={textMuted}
                      inputCls={inputCls}
                      divider={divider}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={
                      saving ||
                      (form.password.length > 0 && form.password !== form.confirmPassword)
                    }
                    className={`w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 ${btnPrimary}`}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </>
              )}
            </form>
          ) : (
            <div className={`flex flex-col items-center justify-center py-12 text-center ${textMuted}`}>
              <Plus size={28} className="mb-3 opacity-40" />
              <p className="text-sm">Select a user to edit permissions</p>
              {canAddUser && (
                <button type="button" onClick={openCreate} className={`mt-3 text-xs font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  or create a new user
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirmUser && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
          >
            <div
              className="absolute inset-0 bg-black/55 backdrop-blur-2xl"
              onClick={() => !deleting && setDeleteConfirmUser(null)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
                isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`px-5 py-4 border-b ${divider} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-red-500/10" : "bg-red-50"}`}>
                    <Trash2 size={18} className={isDark ? "text-red-400" : "text-red-600"} />
                  </div>
                  <div>
                    <div id="delete-user-title" className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Delete user?
                    </div>
                    <div className={`text-xs ${textMuted}`}>
                      Permanently remove <strong>{deleteConfirmUser.username}</strong>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteConfirmUser(null)}
                  className={`p-2 rounded-lg ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteConfirmUser(null)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border ${
                    isDark
                      ? "bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => void handleDeleteUser()}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${btnDanger}`}
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
