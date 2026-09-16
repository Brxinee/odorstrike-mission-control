import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Kicker, PageHead, Panel, Pending, Provenance } from "@/components/mc/ui";
import { getAutomations, toggleAutomation } from "@/lib/mc/queries";
import { formatIst } from "@/lib/utils";

export const Route = createFileRoute("/automations")({
  loader: () => getAutomations(),
  pendingComponent: Pending,
  component: AutomationsPage,
});

type Auto = {
  id: string;
  name: string;
  trigger_event: string;
  condition_text: string;
  action_text: string;
  guardrail: string;
  channel: string;
  cooldown_hours: number;
  retry_policy: string;
  escalation: string | null;
  enabled: number;
  last_run_at: string | null;
  last_outcome: string | null;
  last_entities: number | null;
};

type Run = {
  id: string;
  automation_id: string;
  status: string;
  entities: number;
  evidence: string | null;
  ran_at: string;
};

function AutomationsPage() {
  const data = Route.useLoaderData();
  const rows = data.rows as Auto[];
  const runs = data.runs as Run[];
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function flip(id: string, enabled: boolean) {
    setBusy(id);
    try {
      await toggleAutomation({ data: { id, enabled } });
      toast.success(enabled ? "Enabled in DEMO ledger" : "Disabled in DEMO ledger");
      await router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHead
        kicker="Automations"
        title="Trigger → condition → action"
        aside={<Provenance>DEMO rows · production email still P0</Provenance>}
      />
      <p className="text-sm text-muted">
        Cart recovery and review mail stay blocked while the production email ledger is missing. No automation
        auto-marks paid or auto-purchases stock.
      </p>
      <div className="grid gap-3">
        {rows.map((a) => (
          <Panel key={a.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold">{a.name}</h2>
                  <Badge tone={a.enabled ? "acid" : "neutral"}>{a.enabled ? "on" : "off"}</Badge>
                  <Badge>{a.channel}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted">
                  last {a.last_run_at ? formatIst(a.last_run_at) : "never"} · {a.last_outcome ?? "—"} ·{" "}
                  {a.last_entities ?? 0} entities
                </p>
              </div>
              <button
                type="button"
                disabled={busy === a.id}
                onClick={() => void flip(a.id, !a.enabled)}
                className={`h-10 rounded-sm px-3 text-sm ${a.enabled ? "border border-line bg-surface" : "bg-acid text-acid-fg"}`}
              >
                {a.enabled ? "Disable" : "Enable"}
              </button>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <Kicker>Trigger</Kicker>
                <p className="mt-1 font-mono text-xs">{a.trigger_event}</p>
              </div>
              <div>
                <Kicker>Condition</Kicker>
                <p className="mt-1 font-mono text-xs">{a.condition_text}</p>
              </div>
              <div>
                <Kicker>Action</Kicker>
                <p className="mt-1 text-sm">{a.action_text}</p>
              </div>
              <div>
                <Kicker>Guardrail</Kicker>
                <p className="mt-1 text-sm text-warn">{a.guardrail}</p>
              </div>
              <div>
                <Kicker>Cooldown / retry</Kicker>
                <p className="mt-1 text-sm">
                  {a.cooldown_hours}h · {a.retry_policy}
                </p>
              </div>
              <div>
                <Kicker>Escalation</Kicker>
                <p className="mt-1 text-sm">{a.escalation ?? "—"}</p>
              </div>
            </dl>
          </Panel>
        ))}
      </div>
      <section>
        <Kicker>Recent runs</Kicker>
        <ul className="mt-3 space-y-2">
          {runs.map((r) => (
            <li key={r.id} className="rounded-md border border-line bg-surface px-4 py-3 text-sm">
              <span className="font-mono text-xs text-muted">{r.automation_id}</span>
              <span className="mx-2 text-faint">·</span>
              {r.status} · {r.entities} · {r.evidence}
              <div className="font-mono text-[11px] text-faint">{formatIst(r.ran_at)}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
