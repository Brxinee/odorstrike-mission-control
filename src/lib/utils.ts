import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const IST = "Asia/Kolkata";

export function formatPaise(paise: number | null | undefined): string {
  if (paise == null || !Number.isFinite(paise)) return "DATA UNAVAILABLE";
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatPaiseSigned(paise: number): string {
  const sign = paise < 0 ? "−" : "";
  return sign + formatPaise(Math.abs(paise));
}

export function formatIst(iso: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...opts,
  }).format(d);
}

export function formatIstDate(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function ageMinutes(from: string | Date, now = new Date()) {
  const t = typeof from === "string" ? new Date(from).getTime() : from.getTime();
  return Math.max(0, Math.round((now.getTime() - t) / 60000));
}

export function ageLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  if (h < 48) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function requestId() {
  return `req_${Math.random().toString(36).slice(2, 10)}`;
}
