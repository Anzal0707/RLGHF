"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Star,
  LogOut,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  User,
  Phone,
  Calendar,
  Shield,
  Menu,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Mic,
  Paperclip,
  Building,
  ArrowUpRight,
  Sun,
  Moon,
  Activity,
  Lock,
  Trash2,
  UserCircle,
} from "lucide-react";
import { apiClient, ApiError } from "../lib/apiClient";
import {
  type AuthUser,
  type AdminViewId,
  canAccessView,
  firstAllowedView,
  hasPerm,
  PERMS,
} from "../lib/adminPermissions";
import UserManagement from "./UserManagement";
import UserProfile from "./UserProfile";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Complaint {
  id: number;
  ticket_id: string;
  department: string;
  description: string | null;
  is_anonymous: boolean;
  language: string;
  is_individual_complaint: boolean;
  ind_name: string | null;
  ind_role: string | null;
  ind_department: string | null;
  ind_appearance: string | null;
  complainant_name: string | null;
  complainant_phone: string | null;
  patient_id: string | null;
  voice_file: string | null;
  attachment: string | null;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface Rating {
  id: number;
  department: string;
  rating: number;
  feedback: string | null;
  language: string;
  created_at: string;
}

interface DashboardStats {
  total_complaints: number;
  total_ratings: number;
  avg_rating: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_department: Record<string, number>;
  rating_distribution: Record<string, number>;
  trend_7d: { date: string; count: number }[];
  individual_count: number;
  department_count: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; dot: string; pill: string; text: string }> = {
  NEW:       { label: "New",          dot: "bg-blue-500",   pill: "bg-blue-500/10 border border-blue-500/20",   text: "text-blue-400" },
  REVIEW:    { label: "Under Review", dot: "bg-violet-500", pill: "bg-violet-500/10 border border-violet-500/20", text: "text-violet-400" },
  ASSIGNED:  { label: "Assigned",     dot: "bg-teal-500",   pill: "bg-teal-500/10 border border-teal-500/20",   text: "text-teal-400" },
  ACTION:    { label: "Action Taken", dot: "bg-amber-500",  pill: "bg-amber-500/10 border border-amber-500/20",  text: "text-amber-400" },
  CLOSED:    { label: "Closed",       dot: "bg-slate-500",  pill: "bg-slate-500/10 border border-slate-500/20",  text: "text-slate-400" },
  ESCALATED: { label: "Escalated",    dot: "bg-red-500",    pill: "bg-red-500/10 border border-red-500/20",      text: "text-red-400" },
};

const PRIORITY_CFG: Record<string, { label: string; pill: string; text: string }> = {
  LOW:       { label: "Low",       pill: "bg-slate-500/10 border border-slate-500/20",   text: "text-slate-400" },
  MEDIUM:    { label: "Medium",    pill: "bg-teal-500/10 border border-teal-500/20",     text: "text-teal-400" },
  HIGH:      { label: "High",      pill: "bg-orange-500/10 border border-orange-500/20", text: "text-orange-400" },
  EMERGENCY: { label: "Emergency", pill: "bg-red-500/10 border border-red-500/20",       text: "text-red-400" },
};

// Light mode overrides
const STATUS_CFG_LIGHT: Record<string, { dot: string; pill: string; text: string }> = {
  NEW:       { dot: "bg-blue-500",   pill: "bg-blue-50 border border-blue-200",   text: "text-blue-700" },
  REVIEW:    { dot: "bg-violet-500", pill: "bg-violet-50 border border-violet-200", text: "text-violet-700" },
  ASSIGNED:  { dot: "bg-teal-500",   pill: "bg-teal-50 border border-teal-200",   text: "text-teal-700" },
  ACTION:    { dot: "bg-amber-500",  pill: "bg-amber-50 border border-amber-200",  text: "text-amber-700" },
  CLOSED:    { dot: "bg-slate-400",  pill: "bg-slate-100 border border-slate-200", text: "text-slate-600" },
  ESCALATED: { dot: "bg-red-500",    pill: "bg-red-50 border border-red-200",      text: "text-red-700" },
};

const PRIORITY_CFG_LIGHT: Record<string, { pill: string; text: string }> = {
  LOW:       { pill: "bg-slate-100 border border-slate-200",    text: "text-slate-600" },
  MEDIUM:    { pill: "bg-teal-50 border border-teal-200",       text: "text-teal-700" },
  HIGH:      { pill: "bg-orange-50 border border-orange-200",   text: "text-orange-700" },
  EMERGENCY: { pill: "bg-red-50 border border-red-200",         text: "text-red-700" },
};

const STATUS_OPTIONS = ["NEW", "REVIEW", "ASSIGNED", "ACTION", "CLOSED", "ESCALATED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"];
const PAGE_SIZE = 20;
const DASHBOARD_REFRESH_MS = 30_000;
/** Bypass browser HTTP cache for live admin data. */
const ADMIN_GET_OPTS = { cache: "no-store" as RequestCache };

// ─────────────────────────────────────────────────────────────────────────────
// Small UI components
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status, isDark }: { status: string; isDark: boolean }) {
  const darkCfg = STATUS_CFG[status] ?? { label: status, dot: "bg-slate-500", pill: "bg-slate-700", text: "text-slate-300" };
  const lightOverride = STATUS_CFG_LIGHT[status] ?? { dot: "bg-slate-400", pill: "bg-slate-100", text: "text-slate-600" };
  const cfg = isDark ? darkCfg : { ...darkCfg, ...lightOverride };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.pill} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {STATUS_CFG[status]?.label ?? status}
    </span>
  );
}

function PriorityBadge({ priority, isDark }: { priority: string; isDark: boolean }) {
  const darkCfg = PRIORITY_CFG[priority] ?? { label: priority, pill: "bg-slate-700", text: "text-slate-300" };
  const lightOverride = PRIORITY_CFG_LIGHT[priority] ?? { pill: "bg-slate-100", text: "text-slate-600" };
  const cfg = isDark ? darkCfg : { ...darkCfg, ...lightOverride };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.pill} ${cfg.text}`}>
      {PRIORITY_CFG[priority]?.label ?? priority}
    </span>
  );
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s <= rating ? "#f59e0b" : "none"} stroke={s <= rating ? "#f59e0b" : "#94a3b8"} strokeWidth={2}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function SkeletonRows({ cols = 7, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="animate-pulse">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div className="h-4 rounded bg-slate-700/40 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MiniBarChart (SVG sparkline)
// ─────────────────────────────────────────────────────────────────────────────

function MiniBarChart({ data, isDark }: { data: { date: string; count: number }[]; isDark: boolean }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 400, h = 80, barW = Math.floor(w / data.length) - 4;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full" preserveAspectRatio="none">
        {data.map((d, i) => {
          const barH = Math.max(4, (d.count / max) * h);
          const x = i * (w / data.length) + 2;
          const y = h - barH;
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={barW} height={barH} rx={3}
                fill={isDark ? "#6366f1" : "#4f46e5"}
                opacity={0.8}
              />
              <text
                x={x + barW / 2} y={h + 16}
                textAnchor="middle" fontSize={9}
                fill={isDark ? "#94a3b8" : "#64748b"}
              >
                {d.date}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  isDark: boolean;
  delay?: number;
}

function StatCard({ title, value, sub, icon, accent, isDark, delay = 0 }: StatCardProps) {
  const card = isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={`rounded-2xl border p-5 ${card} flex flex-col gap-3 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{title}</span>
        <div className={`p-2 rounded-xl ${accent} bg-opacity-10`}>{icon}</div>
      </div>
      <div>
        <div className={`text-3xl font-bold tabular-nums ${isDark ? "text-white" : "text-slate-900"}`}>{value}</div>
        {sub && <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-400"}`}>{sub}</div>}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Complaint Detail Modal
// ─────────────────────────────────────────────────────────────────────────────

type DeleteTarget =
  | { kind: "complaint"; item: Complaint }
  | { kind: "rating"; item: Rating };

function DeleteConfirmDialog({
  target,
  isDark,
  deleting,
  onCancel,
  onConfirm,
}: {
  target: DeleteTarget;
  isDark: boolean;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cardBg = isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const divider = isDark ? "border-slate-700" : "border-slate-200";
  const title = target.kind === "complaint" ? "Delete complaint?" : "Delete rating?";
  const detail =
    target.kind === "complaint"
      ? `Permanently remove complaint ${target.item.ticket_id}. This cannot be undone.`
      : `Permanently remove rating #${target.item.id}${target.item.department ? ` (${target.item.department})` : ""}. This cannot be undone.`;

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-record-title"
    >
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-2xl"
        onClick={() => !deleting && onCancel()}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${cardBg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`px-5 py-4 border-b ${divider} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-red-500/10" : "bg-red-50"}`}>
              <Trash2 size={18} className={isDark ? "text-red-400" : "text-red-600"} />
            </div>
            <div>
              <div id="delete-record-title" className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {title}
              </div>
              <div className={`text-xs ${textMuted}`}>{detail}</div>
            </div>
          </div>
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className={`p-2 rounded-lg ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
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
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
              isDark
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            } disabled:opacity-50`}
          >
            {deleting ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ComplaintModal({
  complaint,
  draftStatus,
  isDark,
  onClose,
  onDraftStatusChange,
  onSaveStatus,
  updating,
  statusError,
  statusSuccess,
  canChangeStatus,
  canDelete,
  onDelete,
  deleting,
}: {
  complaint: Complaint;
  draftStatus: string;
  isDark: boolean;
  onClose: () => void;
  onDraftStatusChange: (status: string) => void;
  onSaveStatus: () => void;
  updating: boolean;
  statusError: string | null;
  statusSuccess: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
  onDelete: () => void;
  deleting: boolean;
}) {
  const hasUnsavedStatus = draftStatus !== complaint.status;
  const cardBg = isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";
  const label = isDark ? "text-slate-300 text-xs uppercase tracking-wide" : "text-slate-500 text-xs uppercase tracking-wide";
  const val = isDark ? "text-slate-50 text-sm mt-0.5" : "text-slate-900 text-sm mt-0.5";
  const divider = isDark ? "border-slate-700" : "border-slate-100";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl ${cardBg}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-5 border-b ${divider}`}>
            <div>
              <div className={`font-mono text-sm font-semibold ${isDark ? "text-teal-400" : "text-teal-600"}`}>
                {complaint.ticket_id}
              </div>
              <div className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                {new Date(complaint.created_at).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {canDelete && (
                <button
                  type="button"
                  title="Delete complaint"
                  disabled={deleting || updating}
                  onClick={onDelete}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? "hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                      : "hover:bg-red-50 text-slate-500 hover:text-red-600"
                  } disabled:opacity-50`}
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Status + Priority row */}
            <div className="flex flex-wrap gap-3 items-center">
              <StatusBadge status={complaint.status} isDark={isDark} />
              <PriorityBadge priority={complaint.priority} isDark={isDark} />
              {complaint.is_individual_complaint && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" : "bg-rose-50 border border-rose-200 text-rose-700"}`}>
                  <Users size={10} /> Staff Complaint
                </span>
              )}
            </div>

            {/* Update Status */}
            {canChangeStatus ? (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className={label}>Update Status</div>
                {hasUnsavedStatus && (
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      isDark
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    Unsaved changes
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {STATUS_OPTIONS.map((s) => {
                  const cfg = STATUS_CFG[s];
                  const selected = draftStatus === s;
                  const isSaved = complaint.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={updating}
                      onClick={() => onDraftStatusChange(s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? `${cfg.pill} ${cfg.text} ring-2 ring-offset-1 ${
                              isDark ? "ring-teal-400/60 ring-offset-slate-900" : "ring-teal-500/50 ring-offset-white"
                            }`
                          : isDark
                            ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {cfg.label}
                      {selected && !isSaved && (
                        <span className="sr-only"> (unsaved)</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={updating || !hasUnsavedStatus}
                onClick={onSaveStatus}
                className={`mt-3 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? "bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 shadow-md shadow-teal-500/20"
                    : "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/15"
                }`}
              >
                {updating ? "Saving…" : "Save Status"}
              </button>
              {statusError && (
                <p className={`mt-2 text-xs ${isDark ? "text-red-400" : "text-red-600"}`}>{statusError}</p>
              )}
              <AnimatePresence>
                {statusSuccess && !statusError && (
                  <motion.p
                    role="alert"
                    aria-live="polite"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className={`mt-2 text-xs font-semibold flex items-center gap-1.5 ${
                      isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    <CheckCircle size={14} className="shrink-0" aria-hidden />
                    Status saved.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            ) : (
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                You do not have permission to change complaint status.
              </p>
            )}

            <div className={`border-t ${divider}`} />

            {/* Core details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={label}>Department</div>
                <div className={val}>{complaint.department || "—"}</div>
              </div>
              <div>
                <div className={label}>Language</div>
                <div className={val}>{complaint.language?.toUpperCase() || "—"}</div>
              </div>
              <div>
                <div className={label}>Anonymous</div>
                <div className={val}>{complaint.is_anonymous ? "Yes" : "No"}</div>
              </div>
              <div>
                <div className={label}>EMR ID</div>
                <div className={val}>{complaint.patient_id || "—"}</div>
              </div>
              {!complaint.is_anonymous && (
                <>
                  <div>
                    <div className={label}>Complainant Name</div>
                    <div className={val}>{complaint.complainant_name || "—"}</div>
                  </div>
                  <div>
                    <div className={label}>Phone</div>
                    <div className={val}>{complaint.complainant_phone || "—"}</div>
                  </div>
                </>
              )}
            </div>

            {/* Individual complaint details */}
            {complaint.is_individual_complaint && (
              <>
                <div className={`border-t ${divider}`} />
                <div>
                  <div className={`${label} mb-2`}>Staff Member Details</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={label}>Name</div>
                      <div className={val}>{complaint.ind_name || "—"}</div>
                    </div>
                    <div>
                      <div className={label}>Role</div>
                      <div className={val}>{complaint.ind_role || "—"}</div>
                    </div>
                    <div>
                      <div className={label}>Department</div>
                      <div className={val}>{complaint.ind_department || "—"}</div>
                    </div>
                    <div className="col-span-2">
                      <div className={label}>Appearance / Identification</div>
                      <div className={val}>{complaint.ind_appearance || "—"}</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Description */}
            {complaint.description && (
              <>
                <div className={`border-t ${divider}`} />
                <div>
                  <div className={label}>Description</div>
                  <p className={`text-sm mt-1 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {complaint.description}
                  </p>
                </div>
              </>
            )}

            {/* Attachments */}
            {(complaint.voice_file || complaint.attachment) && (
              <>
                <div className={`border-t ${divider}`} />
                <div className="space-y-3">
                  {complaint.voice_file && (
                    <div>
                      <div className={`${label} mb-1`}>Voice Recording</div>
                      <audio controls src={complaint.voice_file} className="w-full h-10 rounded-lg" />
                    </div>
                  )}
                  {complaint.attachment && (
                    <div>
                      <div className={`${label} mb-1`}>Attachment</div>
                      <a
                        href={complaint.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${
                          isDark ? "border-slate-700 text-teal-400 hover:bg-slate-800" : "border-slate-200 text-teal-600 hover:bg-slate-50"
                        }`}
                      >
                        <Paperclip size={14} />
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Login Screen
// ─────────────────────────────────────────────────────────────────────────────

function LoginScreen({
  isDark,
  onLogin,
  error,
  loading,
}: {
  isDark: boolean;
  onLogin: (u: string, p: string) => void;
  error: string | null;
  loading: boolean;
}) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const bg = isDark ? "bg-slate-950" : "bg-[#f4f7f6]";
  const card = isDark
    ? "bg-slate-900/90 border-slate-700 shadow-2xl shadow-black/50"
    : "bg-white border-slate-200/80 shadow-xl shadow-teal-900/5";
  const inp = isDark
    ? "bg-slate-900/70 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-teal-400"
    : "bg-[#fbfdfd] border-slate-200 text-slate-800 placeholder-slate-400 focus:border-teal-600";
  const lbl = isDark ? "text-slate-300 text-sm font-medium" : "text-slate-700 text-sm font-medium";

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Ambient teal glow — matches main page */}
      {isDark ? (
        <>
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-[110px] pointer-events-none" />
        </>
      )}
      {/* Dot grid */}
      <div className={`absolute inset-0 pointer-events-none opacity-[0.025] ${isDark ? "bg-[radial-gradient(#14b8a6_1px,transparent_1px)]" : "bg-[radial-gradient(#0d9488_1.5px,transparent_1.5px)]"} [background-size:24px_24px]`} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative w-full max-w-sm rounded-2xl border p-8 ${card}`}
      >
        {/* Hospital brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          {/* Eye logo — same gradient as main page */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <svg className="w-8 h-8 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div className="text-center">
            <div className={`flex items-center justify-center gap-1.5 mb-1`}>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isDark ? "text-teal-400/80" : "text-teal-600"}`}>
                Admin Panel
              </span>
            </div>
            <h1 className={`text-base font-extrabold leading-snug ${isDark ? "bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent" : "bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent"}`}>
              Ramlal Golchha Eye Hospital Foundation
            </h1>
            <p className={`text-[10px] mt-1 leading-snug ${isDark ? "text-slate-400" : "text-slate-400"}`}>
              Under the Management of Nepal Eye Program,<br />Tilganga Institute of Ophthalmology
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(u, p);
          }}
          className="space-y-4"
        >
          <div>
            <label className={lbl}>Username</label>
            <div className="relative mt-1">
              <User size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-slate-400"}`} />
              <input
                type="text"
                value={u}
                onChange={(e) => setU(e.target.value)}
                placeholder="admin"
                required
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inp}`}
              />
            </div>
          </div>
          <div>
            <label className={lbl}>Password</label>
            <div className="relative mt-1">
              <Lock size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-slate-400"}`} />
              <input
                type="password"
                value={p}
                onChange={(e) => setP(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inp}`}
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
              >
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 active:scale-[0.98] ${
              isDark
                ? "bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 shadow-lg shadow-teal-500/20"
                : "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/15"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <Lock size={15} />
                Sign in
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────

type ViewId = AdminViewId;

type NavLeaf = { id: ViewId; label: string; icon: typeof LayoutDashboard };
type NavGroup = { id: string; label: string; icon: typeof LayoutDashboard; children: NavLeaf[] };
type NavEntry = NavLeaf | NavGroup;

const BASE_NAV_ITEMS: NavEntry[] = [
  { id: "overview",   label: "Overview",         icon: LayoutDashboard },
  { id: "complaints", label: "Dept. Complaints", icon: MessageSquare },
  { id: "individual", label: "Staff Complaints", icon: Users },
  {
    id: "ratings",
    label: "Ratings",
    icon: Star,
    children: [
      { id: "hospital-ratings", label: "Hospital Ratings",   icon: Activity },
      { id: "dept-ratings",     label: "Department Ratings", icon: Building },
    ],
  },
];

function buildNavItems(user: AuthUser | null): NavEntry[] {
  const items: NavEntry[] = [];
  for (const entry of BASE_NAV_ITEMS) {
    if ("children" in entry) {
      const children = entry.children.filter((child) => canAccessView(user, child.id));
      if (children.length > 0) {
        items.push({ ...entry, children });
      }
    } else if (canAccessView(user, entry.id)) {
      items.push(entry);
    }
  }
  return items;
}

function buildFoundationNavItems(user: AuthUser | null): NavLeaf[] {
  const items: NavLeaf[] = [];
  if (canAccessView(user, "profile")) {
    items.push({ id: "profile", label: "My Profile", icon: UserCircle });
  }
  if (canAccessView(user, "users")) {
    items.push({ id: "users", label: "User Management", icon: Shield });
  }
  return items;
}

function renderNavLeafButton(
  child: NavLeaf,
  active: ViewId,
  collapsed: boolean,
  isDark: boolean,
  onNav: (v: ViewId) => void,
  compact?: boolean,
) {
  const ChildIcon = child.icon;
  const childActive = active === child.id;
  return (
    <button
      key={child.id}
      type="button"
      onClick={() => onNav(child.id)}
      title={collapsed ? child.label : undefined}
      className={`w-full flex items-center gap-2.5 rounded-lg font-medium transition-all duration-150 ${
        compact ? "px-2 py-2 text-[12px]" : "px-2.5 py-2 text-[13px]"
      } ${
        childActive
          ? isDark
            ? "bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20"
            : "bg-teal-600 text-white shadow-md shadow-teal-600/15"
          : isDark
            ? "text-slate-400 hover:text-white hover:bg-slate-800"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      }`}
    >
      <ChildIcon size={compact ? 14 : 15} className="shrink-0" />
      {!collapsed && <span className="truncate text-left">{child.label}</span>}
    </button>
  );
}

function Sidebar({
  active,
  onNav,
  isDark,
  user,
  onLogout,
  collapsed,
  ratingsOpen,
  onToggleRatings,
  foundationNavOpen,
  onToggleFoundationNav,
  navItems,
  foundationNavItems,
}: {
  active: ViewId;
  onNav: (v: ViewId) => void;
  isDark: boolean;
  user: AuthUser | null;
  onLogout: () => void;
  collapsed: boolean;
  ratingsOpen: boolean;
  onToggleRatings: () => void;
  foundationNavOpen: boolean;
  onToggleFoundationNav: () => void;
  navItems: NavEntry[];
  foundationNavItems: NavLeaf[];
}) {
  const sidebarBg = isDark ? "bg-slate-950 border-slate-700" : "bg-white border-slate-200";
  const textMuted = isDark ? "text-slate-400" : "text-slate-400";
  const foundationActive = foundationNavItems.some((c) => c.id === active);
  const hasFoundationChildren = foundationNavItems.length > 0;
  const roleLabel = user?.is_superuser ? "Superuser" : "Staff";
  const foundationToggleTitle = "Ramlal Golchha Eye Hospital Foundation @RLG";

  return (
    <aside
      className={`flex flex-col border-r transition-all duration-300 ${sidebarBg} ${collapsed ? "w-[60px]" : "w-60"} shrink-0 h-dvh min-h-dvh min-h-0 overflow-hidden`}
    >
      {/* Hospital Logo */}
      <div className={`shrink-0 flex items-center gap-3 px-3 py-4 border-b ${isDark ? "border-slate-700" : "border-slate-100"}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
          <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className={`text-[11px] font-extrabold uppercase tracking-wider truncate ${isDark ? "bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent" : "bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent"}`}>
              RLG Eye Hospital
            </div>
            <div className={`text-[9px] truncate ${textMuted}`}>Admin Dashboard</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 min-h-0 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((entry) => {
          // ── Grouped (dropdown) entry, e.g. Ratings ──────────────────────────
          if ("children" in entry) {
            const Icon = entry.icon;
            const groupActive = entry.children.some((c) => c.id === active);
            return (
              <div key={entry.id}>
                <button
                  type="button"
                  onClick={onToggleRatings}
                  aria-expanded={ratingsOpen}
                  title={collapsed ? entry.label : undefined}
                  className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    groupActive
                      ? isDark
                        ? "text-teal-300 bg-slate-800/60"
                        : "text-teal-700 bg-teal-50"
                      : isDark
                        ? "text-slate-400 hover:text-white hover:bg-slate-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={17} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{entry.label}</span>
                      <ChevronDown
                        size={15}
                        className={`shrink-0 transition-transform duration-200 ${ratingsOpen ? "rotate-180" : ""}`}
                      />
                    </>
                  )}
                </button>

                {/* Children */}
                {!collapsed && (
                  <AnimatePresence initial={false}>
                    {ratingsOpen && (
                      <motion.div
                        key="ratings-nav-children"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className={`overflow-hidden mt-0.5 ml-3.5 pl-2.5 space-y-0.5 border-l border-dashed ${isDark ? "border-slate-600" : "border-slate-300"}`}
                      >
                        {entry.children.map((child) =>
                          renderNavLeafButton(child, active, collapsed, isDark, onNav),
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          }

          // ── Leaf entry ──────────────────────────────────────────────────────
          const Icon = entry.icon;
          const isActive = active === entry.id;
          return (
            <button
              key={entry.id}
              onClick={() => onNav(entry.id)}
              title={collapsed ? entry.label : undefined}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? isDark
                    ? "bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20"
                    : "bg-teal-600 text-white shadow-md shadow-teal-600/15"
                  : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{entry.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Account nav — children above foundation / role parent toggle */}
      {user && (
        <div
          className={`shrink-0 px-2 pt-2 border-t ${isDark ? "border-slate-700" : "border-slate-100"}`}
        >
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {hasFoundationChildren && foundationNavOpen && (
                <motion.div
                  key="foundation-nav-children"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`overflow-hidden mb-1 pb-1 space-y-0.5 border-b border-dashed ${isDark ? "border-slate-600" : "border-slate-300"}`}
                >
                  {foundationNavItems.map((child) =>
                    renderNavLeafButton(child, active, collapsed, isDark, onNav, true),
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={hasFoundationChildren ? onToggleFoundationNav : undefined}
              aria-expanded={hasFoundationChildren ? foundationNavOpen : undefined}
              title={collapsed ? foundationToggleTitle : undefined}
              className={`w-full text-left px-2.5 py-2.5 rounded-xl border transition-all duration-150 ${
                foundationActive
                  ? isDark
                    ? "bg-slate-800/90 border-teal-500/40 text-teal-100"
                    : "bg-teal-50 border-teal-200 text-teal-900"
                  : isDark
                    ? "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800"
                    : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
              } ${!hasFoundationChildren ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="flex items-start gap-2">
                <div className="relative shrink-0 mt-0.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950`}>
                    {user.username?.[0]?.toUpperCase() ?? "A"}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 ${
                      isDark ? "border-slate-900" : "border-white"
                    }`}
                  />
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0 pr-1">
                      <div className={`text-[10px] font-semibold leading-snug ${isDark ? "text-white" : "text-slate-900"}`}>
                        Ramlal Golchha Eye Hospital Foundation
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isDark ? "text-teal-400/90" : "text-teal-600"}`}>
                        @RLG
                      </div>
                      <div className={`text-[10px] font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {roleLabel}
                      </div>
                    </div>
                    {hasFoundationChildren && (
                      <ChevronDown
                        size={15}
                        className={`shrink-0 mt-1 transition-transform duration-200 ${foundationNavOpen ? "rotate-180" : ""} ${textMuted}`}
                      />
                    )}
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className={`shrink-0 p-2 border-t ${isDark ? "border-slate-700" : "border-slate-100"} space-y-1`}>
        <button
          onClick={onLogout}
          title={collapsed ? "Sign out" : undefined}
          className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm transition-colors ${
            isDark ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10" : "text-slate-500 hover:text-red-600 hover:bg-red-50"
          }`}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<ViewId>("overview");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [ratingsOpen, setRatingsOpen] = useState(false);
  const [foundationNavOpen, setFoundationNavOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);

  // ── Complaint modal ───────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [draftStatus, setDraftStatus] = useState<string>("NEW");
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deletingRecord, setDeletingRecord] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<{
    type: "success" | "error" | "deleted";
    message: string;
  } | null>(null);

  const refreshGenRef = useRef(0);
  const dataLoadingCountRef = useRef(0);
  const syncInFlightRef = useRef<Promise<void> | null>(null);
  const syncQueuedRef = useRef(false);
  const queryRef = useRef({
    page,
    activeView,
    search,
    statusFilter,
    priorityFilter,
  });
  const filterKeyRef = useRef(
    `${activeView}|${search}|${statusFilter}|${priorityFilter}`,
  );

  queryRef.current = { page, activeView, search, statusFilter, priorityFilter };

  const sidebarNavItems = buildNavItems(currentUser);
  const foundationNavItems = buildFoundationNavItems(currentUser);

  useEffect(() => {
    if (!currentUser) return;
    if (!canAccessView(currentUser, activeView)) {
      setActiveView(firstAllowedView(currentUser));
    }
  }, [currentUser, activeView]);

  useEffect(() => {
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);
    if (selected) {
      setDraftStatus(selected.status);
    }
  }, [selected?.id]);

  useEffect(() => {
    if (!statusUpdateSuccess) return;
    const timer = window.setTimeout(() => setStatusUpdateSuccess(false), 4000);
    return () => window.clearTimeout(timer);
  }, [statusUpdateSuccess]);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) setIsDark(saved === "dark");
    else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) setIsDark(false);

    const token = localStorage.getItem("access_token");
    if (token) {
      checkAuth();
    } else {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const syncDashboardRef = useRef<(silent?: boolean) => Promise<void>>(async () => {});

  // ── Reload when view/filters/page change ─────────────────────────────────
  useEffect(() => {
    if (!authed) return;
    void syncDashboardRef.current(false);
  }, [authed, activeView, search, statusFilter, priorityFilter, page]);

  // ── Reset page when filters change (before next fetch uses new page) ─────
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter, activeView]);

  // ── Auto-refresh while tab is visible ────────────────────────────────────
  useEffect(() => {
    if (!authed) return;
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void syncDashboardRef.current(true);
    }, DASHBOARD_REFRESH_MS);
    return () => clearInterval(timer);
  }, [authed]);

  // ── Refresh when tab regains focus or network reconnects ─────────────────
  useEffect(() => {
    if (!authed) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void syncDashboardRef.current(true);
      }
    };
    const onOnline = () => {
      void syncDashboardRef.current(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, [authed]);

  // ─── Auth helpers ─────────────────────────────────────────────────────────
  async function checkAuth() {
    try {
      const data = await apiClient.get<{ authenticated: boolean; user: AuthUser }>("auth/admin/check-auth");
      if (data.authenticated) {
        setAuthed(true);
        setCurrentUser(normalizeAuthUser(data.user));
      } else {
        doLogout();
      }
    } catch {
      doLogout();
    } finally {
      setAuthLoading(false);
    }
  }

  async function refreshCurrentUser() {
    try {
      const data = await apiClient.get<{ user: AuthUser }>("auth/admin/me", { cache: "no-store" });
      setCurrentUser(normalizeAuthUser(data.user));
    } catch {
      // Keep existing session user if profile refresh fails transiently.
    }
  }

  function normalizeAuthUser(user: AuthUser): AuthUser {
    return {
      ...user,
      groups: user.groups ?? [],
      permissions: user.permissions ?? [],
    };
  }

  async function handleLogin(username: string, password: string) {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const data = await apiClient.post<{ access: string; refresh: string; user: AuthUser }>(
        "auth/admin/login",
        { username, password }
      );
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      setCurrentUser(normalizeAuthUser(data.user));
      setAuthed(true);
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  function doLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setAuthed(false);
    setCurrentUser(null);
  }

  function requestLogout() {
    setLogoutConfirmOpen(true);
  }

  // ─── Data helpers ──────────────────────────────────────────────────────────
  async function runSyncBatch(gen: number, silent: boolean): Promise<boolean> {
    await apiClient.ensureValidAccessToken();
    const [statsOk, complaintsOk, ratingsOk] = await Promise.all([
      fetchStatsForGen(gen),
      fetchComplaintsForGen(gen, silent),
      fetchRatingsForGen(gen, silent),
    ]);
    if (gen === refreshGenRef.current) {
      setLastRefreshed(new Date());
    }
    if (authed) {
      await refreshCurrentUser();
    }
    return statsOk && complaintsOk && ratingsOk;
  }

  async function syncDashboard(silent = false) {
    if (syncInFlightRef.current) {
      syncQueuedRef.current = true;
      return syncInFlightRef.current;
    }

    const execute = async () => {
      do {
        syncQueuedRef.current = false;
        const gen = ++refreshGenRef.current;
        if (!silent) {
          dataLoadingCountRef.current += 1;
          setDataLoading(true);
        }
        try {
          let ok = await runSyncBatch(gen, silent);
          if (!ok && gen === refreshGenRef.current) {
            const token = await apiClient.ensureValidAccessToken();
            if (token) {
              ok = await runSyncBatch(gen, silent);
            }
          }
        } finally {
          if (!silent) {
            dataLoadingCountRef.current = Math.max(0, dataLoadingCountRef.current - 1);
          }
          if (!silent && dataLoadingCountRef.current === 0) {
            setDataLoading(false);
          }
        }
      } while (syncQueuedRef.current);
    };

    syncInFlightRef.current = execute().finally(() => {
      syncInFlightRef.current = null;
    });
    return syncInFlightRef.current;
  }

  syncDashboardRef.current = syncDashboard;

  async function manualRefresh() {
    setIsRefreshing(true);
    await syncDashboard(true);
    setIsRefreshing(false);
  }

  function complaintsPageForFetch() {
    const q = queryRef.current;
    const filterKey = `${q.activeView}|${q.search}|${q.statusFilter}|${q.priorityFilter}`;
    if (filterKeyRef.current !== filterKey) {
      filterKeyRef.current = filterKey;
      return 1;
    }
    return q.page;
  }

  async function fetchStatsForGen(gen: number): Promise<boolean> {
    try {
      const d = await apiClient.get<DashboardStats>("analytics/stats", ADMIN_GET_OPTS);
      if (gen !== refreshGenRef.current) return true;
      setStats(d);
      return true;
    } catch {
      return false;
    }
  }

  async function fetchComplaintsForGen(gen: number, silent: boolean): Promise<boolean> {
    const q = queryRef.current;
    try {
      const params: Record<string, string | number | boolean> = {
        page: complaintsPageForFetch(),
        page_size: PAGE_SIZE,
      };
      if (q.search) params.search = q.search;
      if (q.statusFilter) params.status = q.statusFilter;
      if (q.priorityFilter) params.priority = q.priorityFilter;
      if (q.activeView === "individual") params.is_individual_complaint = "true";
      else if (q.activeView === "complaints") params.is_individual_complaint = "false";

      const d = await apiClient.get<PaginatedResponse<Complaint> | Complaint[]>(
        "complaints/admin/complaints",
        { params, ...ADMIN_GET_OPTS },
      );
      if (gen !== refreshGenRef.current) return true;
      if (Array.isArray(d)) {
        setComplaints(d);
        setComplaintsCount(d.length);
      } else {
        setComplaints(d.results ?? []);
        setComplaintsCount(d.count ?? 0);
      }
      return true;
    } catch {
      if (gen !== refreshGenRef.current) return true;
      return false;
    }
  }

  async function fetchRatingsForGen(gen: number, silent: boolean): Promise<boolean> {
    const q = queryRef.current;
    try {
      const params: Record<string, string | number | boolean> = { page: 1, page_size: 50 };
      if (q.activeView === "hospital-ratings") params.is_hospital_rating = "true";
      else if (q.activeView === "dept-ratings") params.is_hospital_rating = "false";

      const d = await apiClient.get<PaginatedResponse<Rating> | Rating[]>(
        "complaints/admin/ratings",
        { params, ...ADMIN_GET_OPTS },
      );
      if (gen !== refreshGenRef.current) return true;
      if (Array.isArray(d)) {
        setRatings(d);
        setRatingsCount(d.length);
      } else {
        setRatings(d.results ?? []);
        setRatingsCount(d.count ?? 0);
      }
      return true;
    } catch {
      if (gen !== refreshGenRef.current) return true;
      return false;
    }
  }

  const canDeleteComplaint = hasPerm(currentUser, PERMS.deleteComplaint);
  const canDeleteRating = hasPerm(currentUser, PERMS.deleteRating);

  useEffect(() => {
    if (!deleteFeedback) return;
    const t = window.setTimeout(() => setDeleteFeedback(null), 5000);
    return () => window.clearTimeout(t);
  }, [deleteFeedback]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "complaint" && !canDeleteComplaint) {
      setDeleteFeedback({ type: "error", message: "You do not have permission to delete complaints." });
      setDeleteTarget(null);
      return;
    }
    if (deleteTarget.kind === "rating" && !canDeleteRating) {
      setDeleteFeedback({ type: "error", message: "You do not have permission to delete ratings." });
      setDeleteTarget(null);
      return;
    }

    const target = deleteTarget;
    setDeletingRecord(true);
    setDeleteFeedback(null);
    try {
      if (target.kind === "complaint") {
        await apiClient.delete(`complaints/admin/complaints/${target.item.id}`);
        setComplaints((prev) => prev.filter((c) => c.id !== target.item.id));
        setComplaintsCount((n) => Math.max(0, n - 1));
        if (selected?.id === target.item.id) setSelected(null);
        setDeleteFeedback({ type: "deleted", message: `Complaint ${target.item.ticket_id} deleted.` });
      } else {
        await apiClient.delete(`complaints/admin/ratings/${target.item.id}`);
        setRatings((prev) => prev.filter((r) => r.id !== target.item.id));
        setRatingsCount((n) => Math.max(0, n - 1));
        setDeleteFeedback({ type: "deleted", message: `Rating #${target.item.id} deleted.` });
      }
      setDeleteTarget(null);
      await syncDashboard(true);
    } catch (err) {
      setDeleteFeedback({
        type: "error",
        message: err instanceof ApiError ? err.message : "Failed to delete. Please try again.",
      });
    } finally {
      setDeletingRecord(false);
    }
  }

  async function handleSaveStatus() {
    if (!selected || draftStatus === selected.status) return;
    if (!hasPerm(currentUser, PERMS.changeComplaint)) {
      setStatusUpdateError("You do not have permission to change complaint status.");
      return;
    }

    const id = selected.id;
    const newStatus = draftStatus;
    setUpdatingStatus(true);
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);
    try {
      const updated = await apiClient.patch<Complaint>(
        `complaints/admin/complaints/${id}`,
        { status: newStatus },
      );
      setComplaints((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setDraftStatus(updated.status);
      setSelected(updated);
      setStatusUpdateSuccess(true);
      await syncDashboard(true);
    } catch (err) {
      setStatusUpdateError(
        err instanceof ApiError ? err.message : "Failed to update status. Please try again.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  // ─── Derived colors ────────────────────────────────────────────────────────
  const bg = isDark ? "bg-slate-950 text-white" : "bg-[#f4f7f6] text-slate-900";
  const cardBg = isDark
    ? "bg-slate-900/90 border-slate-700"
    : "bg-white border-slate-200/80";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const inputCls = isDark
    ? "bg-slate-900/70 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-teal-400"
    : "bg-[#fbfdfd] border-slate-200 text-slate-800 placeholder-slate-400 focus:border-teal-600";
  const divider = isDark ? "divide-slate-700 border-slate-700" : "divide-slate-100 border-slate-200";
  const tableHover = isDark ? "hover:bg-slate-800/70 cursor-pointer" : "hover:bg-slate-50/80 cursor-pointer";
  const tHead = isDark ? "bg-slate-800/80 text-slate-300" : "bg-slate-50 text-slate-500";

  // ─── Loading screen ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-[#f4f7f6]"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <svg className="w-6 h-6 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // ─── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <LoginScreen isDark={isDark} onLogin={handleLogin} error={loginError} loading={loginLoading} />
    );
  }

  // ─── Pagination helpers ────────────────────────────────────────────────────
  const totalPages = Math.ceil(complaintsCount / PAGE_SIZE);

  // ─── Views ─────────────────────────────────────────────────────────────────

  function renderOverview() {
    const open = stats?.by_status?.NEW ?? 0;
    const escalated = stats?.by_status?.ESCALATED ?? 0;
    const closed = stats?.by_status?.CLOSED ?? 0;
    const maxDept = stats ? Object.entries(stats.by_department).sort((a, b) => b[1] - a[1]).slice(0, 5) : [];
    const maxBar = maxDept[0]?.[1] ?? 1;

    return (
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Complaints"
            value={stats?.total_complaints ?? "—"}
            sub={`${stats?.individual_count ?? 0} staff · ${stats?.department_count ?? 0} dept`}
            icon={<MessageSquare size={18} className="text-teal-400" />}
            accent="bg-teal-500/10"
            isDark={isDark}
            delay={0}
          />
          <StatCard
            title="New / Open"
            value={open}
            sub="Awaiting review"
            icon={<Clock size={18} className="text-blue-400" />}
            accent="bg-blue-500/10"
            isDark={isDark}
            delay={0.05}
          />
          <StatCard
            title="Escalated"
            value={escalated}
            sub="Needs urgent attention"
            icon={<AlertCircle size={18} className="text-red-400" />}
            accent="bg-red-500/10"
            isDark={isDark}
            delay={0.1}
          />
          <StatCard
            title="Avg Rating"
            value={stats ? `${stats.avg_rating}/5` : "—"}
            sub={`${stats?.total_ratings ?? 0} total ratings`}
            icon={<Star size={18} className="text-amber-400" />}
            accent="bg-amber-500/10"
            isDark={isDark}
            delay={0.15}
          />
        </div>

        {/* Trend + Status breakdown row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 7-day trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`lg:col-span-2 rounded-2xl border p-5 ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Complaints — Last 7 Days
                </div>
                <div className={`text-xs mt-0.5 ${textMuted}`}>Daily submission volume</div>
              </div>
              <TrendingUp size={18} className={textMuted} />
            </div>
            <MiniBarChart data={stats?.trend_7d ?? []} isDark={isDark} />
          </motion.div>

          {/* Status breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`rounded-2xl border p-5 ${cardBg}`}
          >
            <div className={`text-sm font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              By Status
            </div>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((s) => {
                const cnt = stats?.by_status?.[s] ?? 0;
                const pct = stats?.total_complaints ? Math.round((cnt / stats.total_complaints) * 100) : 0;
                const cfg = STATUS_CFG[s];
                return (
                  <div key={s} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                    <span className={`text-xs flex-1 ${textMuted}`}>{cfg.label}</span>
                    <span className={`text-xs font-semibold tabular-nums ${isDark ? "text-white" : "text-slate-800"}`}>{cnt}</span>
                    <div className={`w-16 h-1.5 rounded-full ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                      <div
                        className={`h-full rounded-full ${cfg.dot}`}
                        style={{ width: `${pct}%`, transition: "width 0.5s ease" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Department breakdown + Rating distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top departments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl border p-5 ${cardBg}`}
          >
            <div className={`text-sm font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Top Departments by Complaints
            </div>
            <div className="space-y-3">
              {maxDept.length === 0 && (
                <p className={`text-sm ${textMuted}`}>No data yet</p>
              )}
              {maxDept.map(([dept, cnt]) => (
                <div key={dept}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs truncate pr-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{dept}</span>
                    <span className={`text-xs font-semibold tabular-nums ${isDark ? "text-white" : "text-slate-900"}`}>{cnt}</span>
                  </div>
                  <div className={`h-1.5 rounded-full ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(cnt / maxBar) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                        className="h-full rounded-full bg-teal-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Rating distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className={`rounded-2xl border p-5 ${cardBg}`}
          >
            <div className={`text-sm font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Rating Distribution
            </div>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const cnt = stats?.rating_distribution?.[String(star)] ?? 0;
                const total = stats?.total_ratings ?? 0;
                const pct = total ? Math.round((cnt / total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <StarRow rating={star} size={12} />
                    <div className={`flex-1 h-2 rounded-full ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.35 }}
                        className="h-full rounded-full bg-amber-400"
                      />
                    </div>
                    <span className={`text-xs tabular-nums w-8 text-right ${isDark ? "text-slate-400" : "text-slate-500"}`}>{cnt}</span>
                  </div>
                );
              })}
            </div>
            <div className={`mt-3 pt-3 border-t ${divider} flex items-center gap-2`}>
              <StarRow rating={Math.round(stats?.avg_rating ?? 0)} />
              <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {stats?.avg_rating?.toFixed(1) ?? "—"} avg
              </span>
            </div>
          </motion.div>
        </div>

        {/* Recent complaints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-2xl border ${cardBg} overflow-hidden`}
        >
          <div className={`px-5 py-4 border-b ${divider} flex items-center justify-between`}>
            <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Recent Complaints</div>
            <button
              onClick={() => setActiveView("complaints")}
              className={`text-xs font-medium ${isDark ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"} flex items-center gap-1`}
            >
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs font-medium uppercase tracking-wide ${tHead}`}>
                  {["Ticket", "Dept", "Status", "Priority", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${divider}`}>
                {dataLoading ? (
                  <SkeletonRows cols={5} rows={5} />
                ) : (complaints ?? []).slice(0, 5).length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-4 py-8 text-center text-sm ${textMuted}`}>
                      No complaints yet
                    </td>
                  </tr>
                ) : (
                  (complaints ?? []).slice(0, 5).map((c) => (
                    <tr key={c.id} className={`${tableHover} transition-colors`} onClick={() => setSelected(c)}>
                      <td className="px-4 py-3 font-mono text-xs text-teal-500">{c.ticket_id}</td>
                      <td className={`px-4 py-3 text-xs ${textMuted}`}>{c.department}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} isDark={isDark} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={c.priority} isDark={isDark} /></td>
                      <td className={`px-4 py-3 text-xs ${textMuted}`}>
                        {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    );
  }

  function renderComplaintsTable(isIndividual: boolean) {
    const cols = isIndividual
      ? ["Ticket", "Staff Name", "Dept", "Status", "Priority", "Complainant", "Date", ""]
      : ["Ticket", "Dept", "Type", "Status", "Priority", "Complainant", "Date", ""];

    return (
      <div className="space-y-4">
        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket, name, phone…"
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none transition-colors ${inputCls}`}
            />
          </div>
          {/* Status filter */}
          <div className="relative">
            <Filter size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`pl-8 pr-8 py-2 rounded-xl border text-sm outline-none appearance-none cursor-pointer transition-colors ${inputCls}`}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_CFG[s].label}</option>
              ))}
            </select>
            <ChevronDown size={13} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${textMuted}`} />
          </div>
          {/* Priority filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`pl-3 pr-8 py-2 rounded-xl border text-sm outline-none appearance-none cursor-pointer transition-colors ${inputCls}`}
            >
              <option value="">All Priorities</option>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{PRIORITY_CFG[p].label}</option>
              ))}
            </select>
            <ChevronDown size={13} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${textMuted}`} />
          </div>
          {/* Clear */}
          {(search || statusFilter || priorityFilter) && (
            <button
              onClick={() => { setSearch(""); setStatusFilter(""); setPriorityFilter(""); }}
              className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
                isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              <X size={12} /> Clear
            </button>
          )}
        </motion.div>

        {/* Result count */}
        <div className={`text-xs ${textMuted}`}>
          {complaintsCount.toLocaleString()} complaint{complaintsCount !== 1 ? "s" : ""} found
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border overflow-hidden ${cardBg}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs font-medium uppercase tracking-wide ${tHead}`}>
                  {cols.map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${divider}`}>
                {dataLoading ? (
                  <SkeletonRows cols={cols.length} rows={6} />
                ) : (complaints ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={cols.length} className={`px-4 py-12 text-center text-sm ${textMuted}`}>
                      No complaints found
                    </td>
                  </tr>
                ) : (
                  (complaints ?? []).map((c) => (
                    <tr
                      key={c.id}
                      className={`${tableHover} transition-colors`}
                      onClick={() => setSelected(c)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-teal-500 whitespace-nowrap">{c.ticket_id}</td>
                      {isIndividual && (
                        <td className={`px-4 py-3 text-xs font-medium ${isDark ? "text-slate-200" : "text-slate-700"} whitespace-nowrap`}>
                          {c.ind_name || "—"}
                        </td>
                      )}
                      <td className={`px-4 py-3 text-xs ${textMuted} whitespace-nowrap`}>{c.department}</td>
                      {!isIndividual && (
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
                            {c.is_individual_complaint ? "Staff" : "Dept"}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={c.status} isDark={isDark} /></td>
                      <td className="px-4 py-3 whitespace-nowrap"><PriorityBadge priority={c.priority} isDark={isDark} /></td>
                      <td className={`px-4 py-3 text-xs ${textMuted} whitespace-nowrap`}>
                        {c.is_anonymous ? (
                          <span className={`italic ${isDark ? "text-slate-400" : "text-slate-400"}`}>Anonymous</span>
                        ) : (
                          c.complainant_name ?? c.complainant_phone ?? "—"
                        )}
                      </td>
                      <td className={`px-4 py-3 text-xs ${textMuted} whitespace-nowrap`}>
                        {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelected(c); }}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          {canDeleteComplaint && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget({ kind: "complaint", item: c });
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDark
                                  ? "hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                                  : "hover:bg-red-50 text-slate-500 hover:text-red-600"
                              }`}
                              title="Delete complaint"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-between px-4 py-3 border-t ${divider}`}>
              <span className={`text-xs ${textMuted}`}>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                        p === page
                          ? "bg-teal-600 text-white"
                          : isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  function renderRatings(scope: "dept" | "hospital") {
    const rows = ratings ?? [];
    const isHospital = scope === "hospital";
    // Per-scope stats computed from the fetched (already filtered) rows.
    const total = ratingsCount;
    const avg = rows.length ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length) : 0;
    const positive = rows.filter((r) => r.rating >= 4).length;
    const headers = isHospital
      ? ["#", "Rating", "Feedback", "Language", "Date", ""]
      : ["#", "Department", "Rating", "Feedback", "Language", "Date", ""];
    const colCount = headers.length;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title={isHospital ? "Hospital Ratings" : "Department Ratings"}
            value={total}
            icon={<Star size={18} className="text-amber-400" />}
            accent="bg-amber-500/10"
            isDark={isDark}
          />
          <StatCard
            title="Average Score"
            value={rows.length ? `${avg.toFixed(1)}/5` : "—"}
            icon={<Activity size={18} className="text-teal-400" />}
            accent="bg-teal-500/10"
            isDark={isDark}
          />
          <StatCard
            title="Positive (4–5★)"
            value={positive}
            sub="Satisfied patients"
            icon={<CheckCircle size={18} className="text-green-400" />}
            accent="bg-green-500/10"
            isDark={isDark}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border overflow-hidden ${cardBg}`}
        >
          <div className={`px-5 py-4 border-b ${divider} flex items-center justify-between`}>
            <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {isHospital ? "Recent Hospital-wide Ratings" : "Recent Department Ratings"}
            </div>
            <span className={`text-xs ${textMuted}`}>{total} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs font-medium uppercase tracking-wide ${tHead}`}>
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${divider}`}>
                {dataLoading ? (
                  <SkeletonRows cols={colCount} rows={5} />
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={colCount} className={`px-4 py-12 text-center text-sm ${textMuted}`}>
                      {isHospital ? "No hospital ratings yet" : "No department ratings yet"}
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className={`transition-colors ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}`}>
                      <td className={`px-4 py-3 text-xs ${textMuted}`}>{r.id}</td>
                      {!isHospital && (
                        <td className={`px-4 py-3 text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>{r.department}</td>
                      )}
                      <td className="px-4 py-3"><StarRow rating={r.rating} /></td>
                      <td className={`px-4 py-3 text-xs max-w-xs truncate ${textMuted}`}>
                        {(() => {
                          const fb = (r.feedback ?? "").trim();
                          const isEmpty =
                            !fb ||
                            fb === "Direct rating submission" ||
                            fb === "Overall hospital rating";
                          return isEmpty ? (
                            <span className="italic opacity-50">No feedback</span>
                          ) : (
                            fb
                          );
                        })()}
                      </td>
                      <td className={`px-4 py-3 text-xs uppercase ${textMuted}`}>{r.language}</td>
                      <td className={`px-4 py-3 text-xs ${textMuted} whitespace-nowrap`}>
                        {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        {canDeleteRating && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ kind: "rating", item: r })}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark
                                ? "hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                                : "hover:bg-red-50 text-slate-500 hover:text-red-600"
                            }`}
                            title="Delete rating"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    );
  }

  const viewTitles: Record<ViewId, string> = {
    overview: "Overview",
    complaints: "Department Complaints",
    individual: "Staff Complaints",
    "dept-ratings": "Department Ratings",
    "hospital-ratings": "Hospital Ratings",
    users: "User Management",
    profile: "My Profile",
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={`flex h-dvh min-h-dvh ${bg} font-sans relative overflow-hidden`}>
      {/* Ambient teal glow — matches main page */}
      {isDark ? (
        <>
          <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-teal-500/[0.04] rounded-full blur-[140px] pointer-events-none z-0" />
          <div className="fixed top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[130px] pointer-events-none z-0" />
        </>
      ) : (
        <>
          <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-teal-400/[0.07] rounded-full blur-[130px] pointer-events-none z-0" />
          <div className="fixed top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-400/[0.04] rounded-full blur-[120px] pointer-events-none z-0" />
        </>
      )}
      {/* Dot grid */}
      <div className={`fixed inset-0 pointer-events-none z-0 opacity-[0.018] ${isDark ? "bg-[radial-gradient(#14b8a6_1px,transparent_1px)]" : "bg-[radial-gradient(#0d9488_1.5px,transparent_1.5px)]"} [background-size:24px_24px]`} />

      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — hidden on mobile, shown via overlay */}
      <div className={`relative z-10 hidden lg:flex`}>
        <Sidebar
          active={activeView}
          onNav={(v) => { setActiveView(v); setPage(1); }}
          isDark={isDark}
          user={currentUser}
          onLogout={requestLogout}
          collapsed={collapsed}
          ratingsOpen={ratingsOpen}
          onToggleRatings={() => setRatingsOpen((o) => !o)}
          foundationNavOpen={foundationNavOpen}
          onToggleFoundationNav={() => setFoundationNavOpen((o) => !o)}
          navItems={sidebarNavItems}
          foundationNavItems={foundationNavItems}
        />
      </div>

      {/* Sign out confirm */}
      <AnimatePresence>
        {logoutConfirmOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
          >
            <div
              className="absolute inset-0 bg-black/55 backdrop-blur-2xl"
              onClick={() => setLogoutConfirmOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
                isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`px-5 py-4 border-b ${divider} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-red-500/10" : "bg-red-50"}`}>
                    <LogOut size={18} className={isDark ? "text-red-400" : "text-red-600"} />
                  </div>
                  <div className="min-w-0">
                    <div id="logout-confirm-title" className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Confirm sign out
                    </div>
                    <div className={`text-xs ${textMuted}`}>Are you sure you want to sign out?</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLogoutConfirmOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setLogoutConfirmOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    isDark
                      ? "bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLogoutConfirmOpen(false);
                    setMobileSidebarOpen(false);
                    doLogout();
                  }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isDark
                      ? "bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/20"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  Yes, sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-40 lg:hidden"
          >
            <Sidebar
              active={activeView}
              onNav={(v) => { setActiveView(v); setPage(1); setMobileSidebarOpen(false); }}
              isDark={isDark}
              user={currentUser}
              onLogout={requestLogout}
              collapsed={false}
              ratingsOpen={ratingsOpen}
              onToggleRatings={() => setRatingsOpen((o) => !o)}
              foundationNavOpen={foundationNavOpen}
              onToggleFoundationNav={() => setFoundationNavOpen((o) => !o)}
              navItems={sidebarNavItems}
              foundationNavItems={foundationNavItems}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className={`sticky top-0 z-20 flex items-center gap-3 px-4 lg:px-6 py-3 border-b ${isDark ? "bg-slate-950/90 border-slate-700 backdrop-blur-md" : "bg-white/80 border-slate-200 backdrop-blur-md"}`}>
          {/* Mobile menu + collapse toggle */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <button
            className={`hidden lg:flex p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
            onClick={() => setCollapsed((c) => !c)}
          >
            <Menu size={18} />
          </button>

          {/* Title + Hospital */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <div className="min-w-0">
              <h1 className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                {viewTitles[activeView]}
              </h1>
              <p className={`hidden sm:block text-[10px] truncate ${isDark ? "text-teal-400/70" : "text-teal-600/80"}`}>
                Ramlal Golchha Eye Hospital Foundation
              </p>
            </div>
          </div>

          {/* Last refreshed */}
          <div className={`hidden sm:flex items-center gap-1.5 text-xs ${textMuted}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            {isRefreshing ? "Refreshing…" : `Updated ${lastRefreshed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
          </div>

          {/* Refresh button */}
          <button
            onClick={manualRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => {
              const next = !isDark;
              setIsDark(next);
              localStorage.setItem("theme", next ? "dark" : "light");
            }}
            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 shrink-0 shadow-sm shadow-teal-500/20`}>
            {currentUser?.username?.[0]?.toUpperCase() ?? "A"}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence>
            {deleteFeedback && (
              <motion.div
                role="alert"
                aria-live="polite"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`mb-4 px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
                  deleteFeedback.type === "success"
                    ? isDark
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : isDark
                      ? "bg-red-500/10 border-red-500/30 text-red-300"
                      : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {deleteFeedback.type === "success" ? (
                  <CheckCircle size={16} className="shrink-0" />
                ) : deleteFeedback.type === "deleted" ? (
                  <Trash2 size={16} className="shrink-0" />
                ) : (
                  <AlertCircle size={16} className="shrink-0" />
                )}
                {deleteFeedback.message}
                <button
                  type="button"
                  onClick={() => setDeleteFeedback(null)}
                  className="ml-auto p-1 rounded-lg opacity-70 hover:opacity-100"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === "overview" && renderOverview()}
              {activeView === "complaints" && renderComplaintsTable(false)}
              {activeView === "individual" && renderComplaintsTable(true)}
              {activeView === "dept-ratings" && renderRatings("dept")}
              {activeView === "hospital-ratings" && renderRatings("hospital")}
              {activeView === "profile" && currentUser && (
                <UserProfile
                  isDark={isDark}
                  currentUser={currentUser}
                  cardBg={cardBg}
                  textMuted={textMuted}
                  inputCls={inputCls}
                  divider={divider}
                  onUserUpdated={(user) => setCurrentUser(normalizeAuthUser(user))}
                />
              )}
              {activeView === "users" && currentUser && (
                <UserManagement
                  isDark={isDark}
                  currentUser={currentUser}
                  cardBg={cardBg}
                  textMuted={textMuted}
                  inputCls={inputCls}
                  divider={divider}
                  tHead={tHead}
                  tableHover={tableHover}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Complaint detail modal */}
      <AnimatePresence>
        {selected && (
          <ComplaintModal
            complaint={selected}
            draftStatus={draftStatus}
            isDark={isDark}
            onClose={() => setSelected(null)}
            onDraftStatusChange={setDraftStatus}
            onSaveStatus={handleSaveStatus}
            updating={updatingStatus}
            statusError={statusUpdateError}
            statusSuccess={statusUpdateSuccess}
            canChangeStatus={hasPerm(currentUser, PERMS.changeComplaint)}
            canDelete={canDeleteComplaint}
            onDelete={() => setDeleteTarget({ kind: "complaint", item: selected })}
            deleting={deletingRecord}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmDialog
            target={deleteTarget}
            isDark={isDark}
            deleting={deletingRecord}
            onCancel={() => !deletingRecord && setDeleteTarget(null)}
            onConfirm={() => void handleConfirmDelete()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
