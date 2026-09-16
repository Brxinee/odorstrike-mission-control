import { createFileRoute, Link } from "@tanstack/react-router";
import { ActionCard } from "@/components/mc/action-card";
import { Badge, Empty, healthTone, Kicker, PageHead, Panel, Pending, Provenance, severityTone } from "@/components/mc/ui";
import { getIncident } from "@/lib/mc/queries";
import { formatIst } from "@/lib/utils";

export const Route = createFileRoute("/incidents/$code")({
  loader: ({ params }) => getIncident({ data: { code: params.code } }),
  pendingComponent: Pending,
  component: IncidentPage,
});

function IncidentPage() {
  const { code } = Route.useParams();
  const { incident, health, relatedActions } = Route.useLoaderData();

  if (!incident) {
    return (
      <div>
        <PageHead kicker="Incident" title={code} />
        <Empty title="Not in this ledger" body="Unknown incident code." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHead
        kicker="Incident"
        title={incident.code}
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={severityTone(incident.severity)}>{incident.severity}</Badge>
            <Badge>{incident.status}</Badge>
            <Provenance>{incident.service}</Provenance>
          </div>
        }
      />
      <p className="text-lg font-semibold">{incident.title}</p>
      <Panel className="p-4">
        <Kicker>Evidence</Kicker>
        <p className="mt-2 text-sm leading-6 text-muted [overflow-wrap:anywhere]">{incident.evidence}</p>
        {incident.impact ? (
          <p className="mt-3 text-sm">
            <span className="text-faint">Impact · </span>
            {incident.impact}
          </p>
        ) : null}
        {incident.recommended ? <p className="mt-3 text-sm text-acid">{incident.recommended}</p> : null}
        <p className="mt-3 font-mono text-[11px] text-faint">
          first {formatIst(incident.first_seen_at)} · last {formatIst(incident.last_seen_at)}
        </p>
      </Panel>
      {incident.code === "P0-EMAIL-SCHEMA" ? (
        <Panel className="border-danger/40 p-4">
          <Kicker>Playbook — do not run production DDL from here</Kicker>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted [overflow-wrap:anywhere]">
            <li>
              In Smelloff Supabase SQL editor, run{" "}
              <span className="font-mono text-fg">supabase/migrations/20260915_email_events.sql</span>.
            </li>
            <li>
              Then <span className="font-mono text-fg">NOTIFY pgrst, 'reload schema';</span>
            </li>
            <li>Prove a service-role POST to /rest/v1/email_events returns 201, not PGRST205.</li>
            <li>Do not mark email reliable until a test send writes a row and the webhook updates it.</li>
          </ol>
        </Panel>
      ) : null}
      {relatedActions.length ? (
        <section>
          <Kicker>Related actions</Kicker>
          <div className="mt-3 grid gap-3">
            {relatedActions.map((a) => (
              <ActionCard key={a.id} action={a} />
            ))}
          </div>
        </section>
      ) : null}
      <section>
        <Kicker>Service health</Kicker>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {health.map((h) => (
            <Panel key={h.id} className="p-4">
              <div className="flex items-center gap-2">
                <Badge tone={healthTone(h.state)}>{h.state}</Badge>
                <span className="text-sm font-medium">{h.service}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted [overflow-wrap:anywhere]">{h.evidence}</p>
            </Panel>
          ))}
        </div>
      </section>
      <Link to="/incidents" className="text-sm text-info">
        All incidents
      </Link>
    </div>
  );
}
