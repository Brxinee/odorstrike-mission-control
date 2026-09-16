import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Kicker, PageHead, Panel, Pending, Provenance, TableWrap, Td, Th } from "@/components/mc/ui";
import { getAudit } from "@/lib/mc/queries";
import { formatIst, formatPaise } from "@/lib/utils";

export const Route = createFileRoute("/activity")({
  loader: () => getAudit(),
  pendingComponent: Pending,
  component: ActivityPage,
});

function ActivityPage() {
  const { rows, events } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHead
        kicker="Activity"
        title="What the system did"
        desc="event → detection → decision lives here. Actions are the work items. This is the audit, not Settings."
        aside={<Provenance>audit_log + operational_events · DEMO</Provenance>}
      />

      <section>
        <Kicker>Events</Kicker>
        <div className="mt-3 space-y-2">
          {events.map((e) => (
            <Panel key={e.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={e.severity === "critical" ? "danger" : e.severity === "warning" ? "warn" : "neutral"}>
                  {e.severity}
                </Badge>
                <span className="font-mono text-[11px] text-muted">{e.event_type}</span>
                {e.entity_id ? <span className="font-mono text-[11px] text-info">{e.entity_id}</span> : null}
              </div>
              <p className="mt-2 text-sm font-medium">{e.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted [overflow-wrap:anywhere]">{e.evidence}</p>
              <p className="mt-2 font-mono text-[10px] text-faint">
                {formatIst(e.occurred_at)}
                {e.financial_impact_paise != null ? ` · ${formatPaise(e.financial_impact_paise)}` : ""} · {e.confidence}
              </p>
            </Panel>
          ))}
        </div>
      </section>

      <section>
        <Kicker>Audit</Kicker>
        <div className="mt-3">
          <TableWrap minClass="min-w-[720px]">
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Actor</Th>
                <Th>Action</Th>
                <Th>Entity</Th>
                <Th>Result</Th>
                <Th>Request</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line hover:bg-surface-2/60">
                  <Td className="whitespace-nowrap text-muted">{formatIst(r.created_at)}</Td>
                  <Td>{r.actor}</Td>
                  <Td className="font-mono text-xs">{r.action}</Td>
                  <Td className="font-mono text-xs">
                    {r.entity_type}
                    {r.entity_id ? (
                      <>
                        {" · "}
                        {r.entity_type === "order" ? (
                          <Link to="/orders/$code" params={{ code: r.entity_id }} className="text-info">
                            {r.entity_id}
                          </Link>
                        ) : (
                          r.entity_id
                        )}
                      </>
                    ) : null}
                  </Td>
                  <Td>{r.result}</Td>
                  <Td className="font-mono text-[10px] text-faint">{r.request_id}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      </section>
    </div>
  );
}
