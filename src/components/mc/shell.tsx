import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Boxes,
  CircleAlert,
  CreditCard,
  Landmark,
  LayoutDashboard,
  Megaphone,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UserRound,
  Workflow,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { CommandPalette } from "@/components/mc/command-palette";
import { Operator } from "@/components/mc/operator";
import { Badge } from "@/components/mc/ui";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Attention", icon: LayoutDashboard, mobile: true },
  { to: "/orders", label: "Orders", icon: ShoppingBag, mobile: true },
  { to: "/customers", label: "Customers", icon: UserRound, mobile: true },
  { to: "/payments", label: "Payments", icon: CreditCard, mobile: false },
  { to: "/carts", label: "Carts", icon: ShoppingCart, mobile: false },
  { to: "/inventory", label: "Inventory", icon: Boxes, mobile: false },
  { to: "/finance", label: "Finance", icon: Landmark, mobile: false },
  { to: "/marketing", label: "Marketing", icon: Megaphone, mobile: false },
  { to: "/automations", label: "Automations", icon: Workflow, mobile: false },
  { to: "/incidents", label: "Incidents", icon: CircleAlert, mobile: true },
  { to: "/activity", label: "Activity", icon: Activity, mobile: false },
  { to: "/loop", label: "Loop", icon: Sparkles, mobile: false },
  { to: "/architecture", label: "System", icon: Activity, mobile: false },
  { to: "/settings", label: "Settings", icon: Settings, mobile: false },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [palette, setPalette] = useState(false);
  const [operator, setOperator] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOperator((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-bg text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-acid focus:px-3 focus:py-2 focus:text-acid-fg"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col border-r border-line bg-bg-1 md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-line px-4">
          <span className="grid size-7 place-items-center rounded-xs bg-acid font-mono text-[11px] font-bold text-acid-fg">
            SO
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold tracking-tight">Mission Control</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Smelloff</div>
          </div>
        </div>
        <nav className="mc-scroll flex-1 overflow-y-auto px-2 py-3">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "mb-0.5 flex h-10 items-center gap-2.5 rounded-sm px-2.5 text-[13px] font-medium",
                  active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface hover:text-fg",
                )}
              >
                <Icon className={cn("size-4", active ? "text-acid" : "text-faint")} strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-3">
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="flex h-10 w-full items-center gap-2 rounded-sm border border-line bg-surface px-2.5 text-left text-[12px] text-muted"
          >
            <Search className="size-3.5" />
            Search
            <kbd className="ml-auto font-mono text-[10px] text-faint">⌘K</kbd>
          </button>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-faint">Demo ledger · IST</p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-line bg-bg/95 px-3 backdrop-blur md:hidden">
        <span className="grid size-6 place-items-center rounded-xs bg-acid font-mono text-[10px] font-bold text-acid-fg">
          SO
        </span>
        <span className="text-[13px] font-semibold">Mission Control</span>
        <button
          type="button"
          onClick={() => setOperator(true)}
          className="ml-auto grid size-10 place-items-center rounded-sm text-muted"
          aria-label="Operator"
        >
          <Sparkles className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => setPalette(true)}
          className="grid size-10 place-items-center rounded-sm text-muted"
          aria-label="Search"
        >
          <Search className="size-5" />
        </button>
      </header>

      <main id="main" className="md:pl-[220px]">
        <div className="mx-auto max-w-[1280px] px-4 pb-28 pt-4 md:px-6 md:pb-24 md:pt-6">
          <div className="mb-4 flex items-start gap-2 rounded-sm border border-warn/25 bg-warn/10 px-3 py-2">
            <Badge tone="warn">DEMO</Badge>
            <p className="text-xs leading-5 text-warn">
              Operating sample with masked identity. Not live Supabase. Every number has provenance.
            </p>
          </div>
          {children}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 border-t border-line bg-bg-1/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.filter((n) => n.mobile).map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium",
                active ? "text-acid" : "text-muted",
              )}
            >
              <Icon className="size-5" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => setOperator(true)}
        className="fixed bottom-20 right-4 z-30 hidden h-12 items-center gap-2 rounded-full bg-acid px-4 text-sm font-semibold text-acid-fg md:bottom-6 md:flex"
      >
        <Sparkles className="size-4" />
        Operator
        <kbd className="rounded-xs bg-acid-fg/10 px-1.5 font-mono text-[10px]">⌘J</kbd>
      </button>

      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        onAsk={() => {
          setPalette(false);
          setOperator(true);
        }}
      />
      <Operator open={operator} onOpenChange={setOperator} />
    </div>
  );
}
