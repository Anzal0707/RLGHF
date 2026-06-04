"use client";

export interface AuthGroup {
  id: number;
  name: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined?: string | null;
  last_login?: string | null;
  groups: AuthGroup[];
  permissions: string[];
}

export const PERMS = {
  viewComplaint: "complaints.view_complaint",
  changeComplaint: "complaints.change_complaint",
  deleteComplaint: "complaints.delete_complaint",
  viewRating: "complaints.view_rating",
  deleteRating: "complaints.delete_rating",
  viewUser: "auth.view_user",
  addUser: "auth.add_user",
  changeUser: "auth.change_user",
  deleteUser: "auth.delete_user",
  viewGroup: "auth.view_group",
  addGroup: "auth.add_group",
  changeGroup: "auth.change_group",
} as const;

export type AdminViewId =
  | "overview"
  | "complaints"
  | "individual"
  | "dept-ratings"
  | "hospital-ratings"
  | "users"
  | "profile";

export function hasPerm(user: AuthUser | null | undefined, perm: string): boolean {
  if (!user) return false;
  if (user.is_superuser || user.permissions.includes("*")) return true;
  return user.permissions.includes(perm);
}

export function canAccessView(user: AuthUser | null, view: AdminViewId): boolean {
  if (!user) return false;
  switch (view) {
    case "overview":
      return true;
    case "complaints":
    case "individual":
      return hasPerm(user, PERMS.viewComplaint);
    case "dept-ratings":
    case "hospital-ratings":
      return hasPerm(user, PERMS.viewRating);
    case "users":
      return hasPerm(user, PERMS.viewUser);
    case "profile":
      return user.is_staff;
    default:
      return false;
  }
}

export function firstAllowedView(user: AuthUser | null): AdminViewId {
  const order: AdminViewId[] = [
    "overview",
    "complaints",
    "individual",
    "hospital-ratings",
    "dept-ratings",
    "users",
  ];
  return order.find((view) => canAccessView(user, view)) ?? "overview";
}
