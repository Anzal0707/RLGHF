/**
 * Daily rating progress (Asia/Kathmandu). Resets automatically each new local day.
 */

import { ApiError } from "./apiClient";

const STORAGE_KEY = "rlg_daily_ratings_v3";
const LEGACY_KEYS = [
  "rlg_daily_ratings_v2",
  "rlg_hospital_rated_v1",
  "rlg_rated_departments_v1",
];
const KATHMANDU_TZ = "Asia/Kathmandu";

export interface DailyRatingState {
  date: string;
  hospital: boolean;
  departments: string[];
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** YYYY-MM-DD in Asia/Kathmandu */
export function getKathmanduDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KATHMANDU_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function emptyState(forDate?: string): DailyRatingState {
  return {
    date: forDate ?? getKathmanduDateString(),
    hospital: false,
    departments: [],
  };
}

function parseStoredState(raw: string | null): DailyRatingState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DailyRatingState>;
    if (typeof parsed.date !== "string") return null;
    return {
      date: parsed.date,
      hospital: Boolean(parsed.hospital),
      departments: Array.isArray(parsed.departments)
        ? parsed.departments.filter((d): d is string => typeof d === "string")
        : [],
    };
  } catch {
    return null;
  }
}

function readStoredState(): DailyRatingState | null {
  if (!isBrowser()) return null;
  const v3 = parseStoredState(localStorage.getItem(STORAGE_KEY));
  if (v3) return v3;

  // Migrate department progress from v2; never trust v2 hospital flag (dismiss bug).
  const v2 = parseStoredState(localStorage.getItem("rlg_daily_ratings_v2"));
  if (v2 && v2.date === getKathmanduDateString()) {
    return {
      date: v2.date,
      hospital: false,
      departments: v2.departments,
    };
  }
  return null;
}

function persistState(state: DailyRatingState): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    for (const key of LEGACY_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    /* quota / private mode */
  }
}

/** Returns today's rating state; auto-resets when Kathmandu date changes. */
export function loadDailyRatingState(): DailyRatingState {
  const today = getKathmanduDateString();
  const stored = readStoredState();
  if (!stored || stored.date !== today) {
    return emptyState(today);
  }
  return stored;
}

export function getHospitalRated(): boolean {
  return loadDailyRatingState().hospital;
}

export function getRatedDepartments(): string[] {
  return loadDailyRatingState().departments;
}

export function setHospitalRatedPersisted(): void {
  /** Call only after confirmed hospital rating submission (API success or daily-limit sync). */
  const state = loadDailyRatingState();
  state.hospital = true;
  persistState(state);
}

export function setRatedDepartmentsPersisted(departments: Iterable<string>): void {
  const state = loadDailyRatingState();
  state.departments = [...new Set(departments)];
  persistState(state);
}

export function addRatedDepartmentPersisted(department: string): string[] {
  const state = loadDailyRatingState();
  if (!state.departments.includes(department)) {
    state.departments.push(department);
  }
  persistState(state);
  return state.departments;
}

export function isDepartmentRated(department: string, rated?: Set<string>): boolean {
  if (rated) return rated.has(department);
  return getRatedDepartments().includes(department);
}

export function isDailyRatingLimitError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  const code = err.details?.code;
  if (
    code === "daily_hospital_rating_limit" ||
    code === "daily_department_rating_limit"
  ) {
    return true;
  }
  const msg = (err.message || "").toLowerCase();
  return msg.includes("already rated") && msg.includes("today");
}
