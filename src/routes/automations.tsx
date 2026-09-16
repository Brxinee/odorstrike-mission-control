import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Btn, Empty, Kicker, PageHead, Panel, Pending, Provenance, TableWrap, Td, Th } from "@/components/mc/ui";
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
        desc="Cart recovery and review mail stay blocked while the production email ledger is missing. Nothing auto-marks paid or auto-purchases stock."
        aside={<Provenance>DEMO rows · production email still P0</Provenance>}
      />
      {rows.length === 0 ? (
        <Empty title="No automations in this ledger" body="DEMO seed did not write automation rows." />
      ) : (
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
                <Btn variant={a.enabled ? "ghost" : "primary"} disabled={busy === a.id} onClick={() => void flip(a.id, !a.enabled)}>
                  {a.enabled ? "Disable" : "Enable"}
                </Btn>
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
      )}
      <section>
        <Kicker>Recent runs</Kicker>
        {runs.length === 0 ? (
          <Empty title="No runs" body="Nothing has fired in this DEMO ledger." />
        ) : (
          <div className="mt-3">
            <TableWrap minClass="min-w-[640px]">
              <thead>
                <tr>
                  <Th>Automation</Th>
                  <Th>Status</Th>
                  <Th>Entities</Th>
                  <Th>Evidence</Th>
                  <Th>When</Th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <Td className="font-mono text-xs">{r.automation_id}</Td>
                    <Td>{r.status}</Td>
                    <Td className="font-mono tabular">{r.entities}</Td>
                    <Td className="text-muted">{r.evidence ?? "—"}</Td>
                    <Td className="whitespace-nowrap text-muted">{formatIst(r.ran_at)}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        )}
      </section>
    </div>
  );
}
