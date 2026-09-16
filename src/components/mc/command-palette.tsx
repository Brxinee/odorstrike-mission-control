import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { searchWorkspace } from "@/lib/mc/queries";
import { formatPaise } from "@/lib/utils";

type SearchData = Awaited<ReturnType<typeof searchWorkspace>>;

const GO = [
  { to: "/", label: "Attention" },
  { to: "/orders", label: "Orders" },
  { to: "/payments", label: "Payments — verify UPI" },
  { to: "/carts", label: "Open carts" },
  { to: "/inventory", label: "Inventory / forecast" },
  { to: "/customers", label: "Customers" },
  { to: "/finance", label: "Finance" },
  { to: "/marketing", label: "Marketing" },
  { to: "/automations", label: "Automations" },
  { to: "/incidents", label: "Incidents / P0 email schema" },
  { to: "/activity", label: "Activity / audit" },
  { to: "/loop", label: "Storefront loop / experiments" },
  { to: "/architecture", label: "Architecture maps" },
  { to: "/settings", label: "Settings" },
] as const;

const DO = [
  { to: "/payments", label: "Verify pending UPI" },
  { to: "/carts", label: "Open inactive carts" },
  { to: "/inventory", label: "Show low stock / forecast" },
  { to: "/incidents", label: "Show incidents" },
  { to: "/orders", label: "Show failed emails" },
  { to: "/", label: "Show today's revenue" },
  { to: "/", label: "Show yesterday vs today" },
  { to: "/automations", label: "Open automations" },
] as const;

export function CommandPalette({
  open,
  onOpenChange,
  onAsk,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAsk: () => void;
}) {
  const navigate = useNavigate();
  const [data, setData] = useState<SearchData | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    searchWorkspace()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData({ orders: [], customers: [], incidents: [], payments: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  function go(to: string, params?: Record<string, string>) {
    onOpenChange(false);
    void navigate({ to: to as never, params: params as never });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-bg/70"
        aria-label="Close search"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative mx-auto mt-[12vh] w-[min(640px,calc(100%-1.5rem))] overflow-hidden rounded-md border border-line bg-surface shadow-2xl">
        <Command label="Command palette" className="flex flex-col">
          <Command.Input
            autoFocus
            placeholder="Find order, customer, incident…"
            className="h-12 w-full border-b border-line bg-transparent px-4 text-sm text-fg placeholder:text-faint"
          />
          <Command.List className="mc-scroll max-h-[360px] overflow-y-auto py-2">
            <Command.Empty className="px-4 py-8 text-center text-sm text-muted">No matches.</Command.Empty>
            <Command.Group heading="Ask">
              <Command.Item
                value="ask operator what needs attention"
                onSelect={onAsk}
                className="flex h-10 cursor-pointer items-center px-4 text-sm"
              >
                Ask Operator — what needs attention
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Do">
              {DO.map((g) => (
                <Command.Item
                  key={g.label}
                  value={g.label}
                  onSelect={() => go(g.to)}
                  className="flex h-10 cursor-pointer items-center px-4 text-sm"
                >
                  {g.label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Go">
              {GO.map((g) => (
                <Command.Item
                  key={g.to}
                  value={g.label}
                  onSelect={() => go(g.to)}
                  className="flex h-10 cursor-pointer items-center px-4 text-sm"
                >
                  {g.label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Orders">
              {(data?.orders ?? []).map((o) => (
                <Command.Item
                  key={o.order_code}
                  value={`${o.order_code} ${o.status} ${o.city ?? ""}`}
                  onSelect={() => go("/orders/$code", { code: o.order_code })}
                  className="flex h-10 cursor-pointer items-center justify-between gap-3 px-4 text-sm"
                >
                  <span className="font-mono">{o.order_code}</span>
                  <span className="text-muted">
                    {o.status} · {formatPaise(o.amount_paise)}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Customers">
              {(data?.customers ?? []).map((c) => (
                <Command.Item
                  key={c.id}
                  value={`${c.display_code} ${c.city ?? ""} customer`}
                  onSelect={() => go("/customers/$id", { id: c.id })}
                  className="flex h-10 cursor-pointer items-center justify-between gap-3 px-4 text-sm"
                >
                  <span>{c.display_code}</span>
                  <span className="text-muted">
                    {c.city ?? "—"} · {c.order_count} orders
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Incidents">
              {(data?.incidents ?? []).map((i) => (
                <Command.Item
                  key={i.code}
                  value={`${i.code} ${i.title}`}
                  onSelect={() => go("/incidents/$code", { code: i.code })}
                  className="flex h-10 cursor-pointer items-center justify-between gap-3 px-4 text-sm"
                >
                  <span className="font-mono">{i.code}</span>
                  <span className="truncate text-muted">{i.title}</span>
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Payments">
              {(data?.payments ?? []).map((p) => (
                <Command.Item
                  key={p.id}
                  value={`${p.order_code} ${p.status} payment ${p.id}`}
                  onSelect={() => go("/payments/$id", { id: p.id })}
                  className="flex h-10 cursor-pointer items-center justify-between gap-3 px-4 text-sm"
                >
                  <span className="font-mono">{p.order_code}</span>
                  <span className="text-muted">
                    {p.status} · {formatPaise(p.amount_paise)}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
