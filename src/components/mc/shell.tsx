import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Boxes,
  CircleAlert,
  CreditCard,
  Landmark,
  LayoutDashboard,
  Megaphone,
  MoreHorizontal,
  Network,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UserRound,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CommandPalette } from "@/components/mc/command-palette";
import { Operator } from "@/components/mc/operator";
import { Badge, Kbd } from "@/components/mc/ui";
import { cn, IST } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  mobile: boolean;
};

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Operate",
    items: [
      { to: "/", label: "Attention", icon: LayoutDashboard, mobile: true },
      { to: "/orders", label: "Orders", icon: ShoppingBag, mobile: true },
      { to: "/payments", label: "Payments", icon: CreditCard, mobile: true },
      { to: "/carts", label: "Carts", icon: ShoppingCart, mobile: false },
      { to: "/customers", label: "Customers", icon: UserRound, mobile: false },
    ],
  },
  {
    label: "Money",
    items: [
      { to: "/finance", label: "Finance", icon: Landmark, mobile: false },
      { to: "/inventory", label: "Inventory", icon: Boxes, mobile: false },
    ],
  },
  {
    label: "Growth",
    items: [
      { to: "/marketing", label: "Marketing", icon: Megaphone, mobile: false },
      { to: "/loop", label: "Loop", icon: Sparkles, mobile: false },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/incidents", label: "Incidents", icon: CircleAlert, mobile: false },
      { to: "/automations", label: "Automations", icon: Workflow, mobile: false },
      { to: "/activity", label: "Activity", icon: Activity, mobile: false },
      { to: "/architecture", label: "Maps", icon: Network, mobile: false },
      { to: "/settings", label: "Settings", icon: Settings, mobile: false },
    ],
  },
];

const ALL: NavItem[] = GROUPS.flatMap((g) => g.items);
const MOBILE: NavItem[] = ALL.filter((i) => i.mobile);

const JUMP: Record<string, string> = {
  h: "/",
  o: "/orders",
  p: "/payments",
  c: "/customers",
  k: "/carts",
  f: "/finance",
  i: "/inventory",
  m: "/marketing",
  n: "/incidents",
  a: "/activity",
  s: "/settings",
};

const SHORTCUTS: { keys: string; does: string }[] = [
  { keys: "⌘K", does: "Search / jump / do" },
  { keys: "/", does: "Open search" },
  { keys: "⌘J", does: "Operator" },
  { keys: "G then H", does: "Attention" },
  { keys: "G then O", does: "Orders" },
  { keys: "G then P", does: "Payments" },
  { keys: "G then C", does: "Customers" },
  { keys: "G then F", does: "Finance" },
  { keys: "G then I", does: "Inventory" },
  { keys: "?", does: "This list" },
  { keys: "Esc", does: "Close overlay" },
];

function IstClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const label = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  return (
    <p className="font-mono text-[10px] uppercase tracking-wider text-faint" suppressHydrationWarning>
      {label} IST
    </p>
  );
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [palette, setPalette] = useState(false);
  const [operator, setOperator] = useState(false);
  const [more, setMore] = useState(false);
  const [help, setHelp] = useState(false);
  const pendingG = useRef(false);
  const gTimer = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOperator((v) => !v);
        return;
      }
      if (isTypingTarget(e.target)) return;
      if (e.key === "Escape") {
        setPalette(false);
        setOperator(false);
        setMore(false);
        setHelp(false);
        pendingG.current = false;
        return;
      }
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setHelp((v) => !v);
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setPalette(true);
        return;
      }
      if (pendingG.current) {
        pendingG.current = false;
        if (gTimer.current) window.clearTimeout(gTimer.current);
        const to = JUMP[e.key.toLowerCase()];
        if (to) {
          e.preventDefault();
          void navigate({ to: to as never });
        }
        return;
      }
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        pendingG.current = true;
        if (gTimer.current) window.clearTimeout(gTimer.current);
        gTimer.current = window.setTimeout(() => {
          pendingG.current = false;
        }, 800);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  useEffect(() => {
    setMore(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-bg text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-acid focus:px-3 focus:py-2 focus:text-acid-fg"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-bg-1 md:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
          <span className="grid size-7 place-items-center rounded-xs bg-acid font-mono text-[11px] font-bold text-acid-fg">
            SO
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight">Mission Control</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Smelloff</div>
          </div>
        </div>
        <nav className="mc-scroll flex-1 overflow-y-auto px-2 py-3">
          {GROUPS.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="px-2.5 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{group.label}</p>
              {group.items.map((item) => {
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "mb-0.5 flex h-9 items-center gap-2.5 rounded-sm px-2.5 text-[13px] font-medium transition-colors duration-150",
                      active ? "mc-nav-active bg-surface-2 text-fg" : "text-muted hover:bg-surface hover:text-fg",
                    )}
                  >
                    <Icon className={cn("size-4", active ? "text-acid" : "text-faint")} strokeWidth={1.75} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="flex h-11 w-full items-center gap-2 rounded-sm border border-line bg-surface px-2.5 text-left text-sm text-muted transition-colors hover:text-fg"
          >
            <Search className="size-3.5" />
            Search
            <span className="ml-auto flex items-center gap-1">
              <Kbd>⌘K</Kbd>
            </span>
          </button>
          <div className="mt-2 flex items-center justify-between gap-2">
            <IstClock />
            <button
              type="button"
              onClick={() => setHelp(true)}
              className="font-mono text-[10px] uppercase tracking-wider text-faint hover:text-muted"
            >
              ? shortcuts
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-line bg-bg/95 px-3 backdrop-blur md:hidden">
        <span className="grid size-6 place-items-center rounded-xs bg-acid font-mono text-[10px] font-bold text-acid-fg">
          SO
        </span>
        <span className="text-sm font-semibold">Mission Control</span>
        <button
          type="button"
          onClick={() => setOperator(true)}
          className="ml-auto grid size-11 place-items-center rounded-sm text-muted"
          aria-label="Operator"
        >
          <Sparkles className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => setPalette(true)}
          className="grid size-11 place-items-center rounded-sm text-muted"
          aria-label="Search"
        >
          <Search className="size-5" />
        </button>
      </header>

      <main id="main" className="md:pl-60">
        <div className="mx-auto max-w-[1280px] px-4 pb-28 pt-4 md:px-6 md:pb-24 md:pt-6">
          <div className="mb-5 flex items-start gap-2 rounded-md border border-warn/25 bg-warn/10 px-3 py-2">
            <Badge tone="warn">DEMO</Badge>
            <p className="text-xs leading-5 text-warn">
              Operating sample with masked identity. Not live Supabase. Every number has provenance.
            </p>
          </div>
          <div key={pathname} className="mc-page">
            {children}
          </div>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 border-t border-line bg-bg-1/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {MOBILE.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium",
                active ? "text-acid" : "text-muted",
              )}
            >
              <Icon className="size-5" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMore(true)}
          className={cn(
            "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium",
            more ? "text-acid" : "text-muted",
          )}
        >
          <MoreHorizontal className="size-5" strokeWidth={1.75} />
          More
        </button>
      </nav>

      <button
        type="button"
        onClick={() => setOperator(true)}
        className="fixed bottom-20 right-4 z-30 hidden h-12 items-center gap-2 rounded-full bg-acid px-4 text-sm font-semibold text-acid-fg transition-transform duration-150 active:scale-[0.96] md:bottom-6 md:flex"
      >
        <Sparkles className="size-4" />
        Operator
        <Kbd>⌘J</Kbd>
      </button>

      {more ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-bg/70" aria-label="Close menu" onClick={() => setMore(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-lg border border-line bg-bg-1 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-surface-3" />
            <div className="flex items-center justify-between px-4 pb-2">
              <p className="text-sm font-semibold">All sections</p>
              <button type="button" className="grid size-11 place-items-center" onClick={() => setMore(false)} aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            {GROUPS.map((group) => (
              <div key={group.label} className="px-2 pb-3">
                <p className="px-2 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{group.label}</p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex h-12 items-center gap-3 rounded-sm px-3 text-sm",
                        active ? "bg-surface-2 text-fg" : "text-muted",
                      )}
                    >
                      <Icon className={cn("size-4", active ? "text-acid" : "text-faint")} strokeWidth={1.75} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {help ? (
        <div className="fixed inset-0 z-50">
          <button type="button" className="absolute inset-0 bg-bg/70" aria-label="Close shortcuts" onClick={() => setHelp(false)} />
          <div className="relative mx-auto mt-[16vh] w-[min(420px,calc(100%-1.5rem))] rounded-lg border border-line bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">Keyboard</p>
              <Kbd>?</Kbd>
            </div>
            <ul className="space-y-2">
              {SHORTCUTS.map((s) => (
                <li key={s.keys} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted">{s.does}</span>
                  <span className="font-mono text-[11px] text-faint">{s.keys}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

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
