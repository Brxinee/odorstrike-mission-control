import { createFileRoute } from "@tanstack/react-router";
import { Badge, healthTone, Kicker, PageHead, Panel, Pending, Provenance, severityTone } from "@/components/mc/ui";
import { getIncidents } from "@/lib/mc/queries";
import { formatIst } from "@/lib/utils";

export const Route = createFileRoute("/incidents")({
  loader: () => getIncidents(),
  pendingComponent: Pending,
  component: IncidentsPage,
});

type Inc = {
  id: string;
  code: string;
  title: string;
  service: string;
  severity: string;
  status: string;
  evidence: string;
  impact: string | null;
  recommended: string | null;
  first_seen_at: string;
  last_seen_at: string;
};

type Health = {
  id: string;
  service: string;
  state: string;
  evidence: string;
  last_success_at: string | null;
  last_failure_at: string | null;
  latency_ms: number | null;
  failure_streak: number;
  impact: string | null;
};

function IncidentsPage() {
  const data = Route.useLoaderData();
  const rows = data.rows as Inc[];
  const health = data.health as Health[];

  return (
    <div className="space-y-8">
      <PageHead
        kicker="Incidents"
        title="Fail visible"
        aside={<Provenance>Not live-probed from this instance except DEMO encoding</Provenance>}
      />

      <Panel className="border-danger/40 p-4">
        <Kicker>P0 playbook — do not run production DDL from here</Kicker>
        <h2 className="mt-2 text-lg font-semibold">public.email_events missing in production schema cache</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted [overflow-wrap:anywhere]">
          <li>
            In the Smelloff Supabase SQL editor for project <span className="font-mono text-fg">tnuqjydmoxczdjnsgpci</span>,
            run <span className="font-mono text-fg">supabase/migrations/20260915_email_events.sql</span> (CREATE IF NOT
            EXISTS — idempotent).
          </li>
          <li>
            Then <span className="font-mono text-fg">NOTIFY pgrst, 'reload schema';</span> The git migration does not
            include this.
          </li>
          <li>
            Verify <span className="font-mono text-fg">pg_tables</span> shows <span className="font-mono">public.email_events</span>{" "}
            and a service-role POST to <span className="font-mono">/rest/v1/email_events</span> returns 201, not PGRST205.
          </li>
          <li>
            Do not mark email Verified until a test send writes a row and the Resend webhook updates it. Git having the
            file is not runtime.
          </li>
          <li>
            Do not invent a second table. Harden <span className="font-mono">persistEmailEvent</span> to classify
            PGRST205 as SCHEMA_MISMATCH; keep send; make failure visible.
          </li>
        </ol>
        <p className="mt-3 text-xs text-warn">
          This Mission Control instance cannot reach production Supabase. The playbook is the operator instruction —
          executing it is a Smelloff-repo / dashboard action.
        </p>
      </Panel>

      <div className="space-y-3">
        {rows.map((inc) => (
          <Panel key={inc.id} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={severityTone(inc.severity)}>{inc.severity}</Badge>
              <Badge>{inc.status}</Badge>
              <span className="font-mono text-xs text-muted">{inc.code}</span>
              <span className="text-xs text-faint">{inc.service}</span>
            </div>
            <h2 className="mt-2 text-base font-semibold">{inc.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted [overflow-wrap:anywhere]">{inc.evidence}</p>
            {inc.impact ? (
              <p className="mt-2 text-sm">
                <span className="text-faint">Impact · </span>
                {inc.impact}
              </p>
            ) : null}
            {inc.recommended ? (
              <p className="mt-2 text-sm text-acid">{inc.recommended}</p>
            ) : null}
            <p className="mt-3 font-mono text-[11px] text-faint">
              first {formatIst(inc.first_seen_at)} · last {formatIst(inc.last_seen_at)}
            </p>
          </Panel>
        ))}
      </div>

      <section>
        <Kicker>Health checks</Kicker>
        <p className="mt-1 text-xs text-muted">Configured ≠ operational. UNPROVEN means we lack last-success evidence.</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {health.map((h) => (
            <Panel key={h.id} className="p-4">
              <div className="flex items-center gap-2">
                <Badge tone={healthTone(h.state)}>{h.state}</Badge>
                <span className="text-sm font-medium">{h.service}</span>
                {h.latency_ms != null ? <span className="ml-auto font-mono text-[11px] text-faint">{h.latency_ms} ms</span> : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted [overflow-wrap:anywhere]">{h.evidence}</p>
              {h.impact ? <p className="mt-1 text-xs text-warn">{h.impact}</p> : null}
              <p className="mt-2 font-mono text-[11px] text-faint">
                ok {h.last_success_at ? formatIst(h.last_success_at) : "never"} · fail{" "}
                {h.last_failure_at ? formatIst(h.last_failure_at) : "never"} · streak {h.failure_streak}
              </p>
            </Panel>
          ))}
        </div>
      </section>
    </div>
  );
}
