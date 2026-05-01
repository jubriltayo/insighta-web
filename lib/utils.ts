import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDateShort(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function pct(val: number) {
  return `${Math.round(val * 100)}%`;
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function genderBadgeClass(gender: string) {
  if (gender === "male") return "badge-blue";
  if (gender === "female") return "badge-accent";
  return "badge-slate";
}

export function ageGroupBadgeClass(group: string) {
  const map: Record<string, string> = {
    child: "badge-amber",
    teen: "badge-amber",
    adult: "badge-green",
    senior: "badge-slate",
  };
  return map[group] ?? "badge-slate";
}