import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Provenance({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{children}</p>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
      {children}
    </span>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "acid" | "warn" | "danger" | "info";
  children: ReactNode;
}) {
  const map = {
    neutral: "bg-surface-2 text-muted border-line",
    acid: "bg-acid text-acid-fg border-acid",
    warn: "bg-warn/15 text-warn border-warn/30",
    danger: "bg-danger/15 text-danger border-danger/30",
    info: "bg-info/15 text-info border-info/30",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}

export function confidenceTone(c: string): "acid" | "warn" | "info" | "neutral" {
  if (c === "PROVEN") return "acid";
  if (c === "INFERRED") return "warn";
  if (c === "UNKNOWN") return "info";
  return "neutral";
}

export function severityTone(s: string): "danger" | "warn" | "info" | "neutral" {
  if (s === "critical") return "danger";
  if (s === "warning") return "warn";
  if (s === "info") return "info";
  return "neutral";
}

export function Btn({
  children,
  onClick,
  variant = "ghost",
  disabled,
  type = "button",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const v = {
    primary: "bg-acid text-acid-fg hover:brightness-95",
    ghost: "bg-surface-2 text-fg border border-line hover:border-line-strong",
    danger: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
  } as const;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-sm px-3 text-sm font-medium transition-[transform,opacity,filter] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40",
        v[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 min-h-11 items-center rounded-sm px-3 text-sm font-medium transition-colors duration-150",
        active ? "bg-acid text-acid-fg" : "border border-line bg-surface text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-line bg-surface shadow-[0_0_0_1px_rgba(255,255,255,0.03)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Metric({
  label,
  value,
  hint,
  provenance,
  delta,
}: {
  label: string;
  value: string;
  hint?: string;
  provenance: string;
  delta?: number | null;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-line bg-surface p-4">
      <Kicker>{label}</Kicker>
      <div className="mt-2 font-mono text-2xl tabular tracking-tight text-fg">{value}</div>
      {hint ? <p className="mt-1 text-xs leading-5 text-muted">{hint}</p> : null}
      {delta != null && Number.isFinite(delta) ? (
        <p className={cn("mt-1 font-mono text-xs tabular", delta >= 0 ? "text-acid" : "text-danger")}>
          {delta >= 0 ? "+" : "−"}
          {Math.abs(delta).toLocaleString("en-IN")} vs yesterday
        </p>
      ) : null}
      <div className="mt-3">
        <Provenance>{provenance}</Provenance>
      </div>
    </div>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line px-5 py-12 text-center">
      <p className="text-sm font-medium text-fg">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}

export function PageHead({
  kicker,
  title,
  aside,
  desc,
}: {
  kicker: string;
  title: string;
  aside?: ReactNode;
  desc?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0 max-w-3xl">
        <Kicker>{kicker}</Kicker>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        {desc ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{desc}</p> : null}
      </div>
      {aside}
    </div>
  );
}

export function Pending() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 animate-pulse rounded-sm bg-surface-2" />
      <div className="h-36 animate-pulse rounded-lg bg-surface" />
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-surface" />
        ))}
      </div>
    </div>
  );
}

export function TableWrap({
  children,
  minClass = "min-w-[880px]",
}: {
  children: ReactNode;
  minClass?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className={cn("mc-table w-full border-collapse", minClass)}>{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn("px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-faint", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-3 py-3 text-sm", className)}>{children}</td>;
}

export function orderTone(status: string): "acid" | "warn" | "danger" | "info" | "neutral" {
  if (status === "delivered" || status === "captured" || status === "collected") return "acid";
  if (status === "upi_pending" || status === "pending_verify" || status === "cod_pending") return "warn";
  if (status === "rto" || status === "cancelled" || status === "refund_due" || status === "FAILED") return "danger";
  if (status === "dispatched" || status === "confirmed" || status === "out_for_delivery" || status === "sent")
    return "info";
  return "neutral";
}

export function healthTone(state: string): "acid" | "warn" | "danger" | "info" | "neutral" {
  if (state === "OPERATIONAL") return "acid";
  if (state === "DEGRADED" || state === "WATCH") return "warn";
  if (state === "DOWN") return "danger";
  if (state === "UNPROVEN" || state === "CONFIGURED") return "info";
  return "neutral";
}
