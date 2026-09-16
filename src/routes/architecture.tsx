import { createFileRoute } from "@tanstack/react-router";
import { Badge, Kicker, PageHead, Pending, TableWrap, Td, Th } from "@/components/mc/ui";
import { evolve, kill, keep, maps, roadmap } from "@/lib/mc/architecture";
import { getSot } from "@/lib/mc/queries";

export const Route = createFileRoute("/architecture")({
  loader: () => getSot(),
  pendingComponent: Pending,
  component: ArchitecturePage,
});

type Sot = {
  fact: string;
  source: string;
  current_impl: string;
  risk: string;
  recommended: string;
  status: string;
};

function sotTone(s: string): "danger" | "warn" | "acid" | "neutral" {
  if (s === "P0") return "danger";
  if (s === "WATCH") return "warn";
  if (s === "OK") return "acid";
  return "neutral";
}

function ArchitecturePage() {
  const { rows } = Route.useLoaderData();
  const sot = rows as Sot[];

  return (
    <div className="space-y-10">
      <PageHead
        kicker="Phase 0"
        title="Architecture maps"
        desc="Living map for the two production repos. Production cannot be DDL’d from here."
      />

      {Object.entries(maps).map(([key, section]) => (
        <section key={key}>
          <Kicker>Map {key}</Kicker>
          <h2 className="mt-1 text-lg font-semibold">{section.title}</h2>
          <div className="mt-3 space-y-2">
            {section.body.map((p) => (
              <p key={p.slice(0, 48)} className="text-sm leading-6 text-muted">
                {p}
              </p>
            ))}
          </div>
        </section>
      ))}

      <section>
        <Kicker>Map B · live matrix</Kicker>
        <h2 className="mt-1 text-lg font-semibold">Source of truth</h2>
        <div className="mt-3">
          <TableWrap minClass="min-w-[960px]">
            <thead>
              <tr>
                <Th>Fact</Th>
                <Th>Source</Th>
                <Th>Current</Th>
                <Th>Risk</Th>
                <Th>Do</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {sot.map((r) => (
                <tr key={r.fact} className="border-t border-line align-top hover:bg-surface-2/60">
                  <Td className="font-medium">{r.fact}</Td>
                  <Td className="text-xs text-muted">{r.source}</Td>
                  <Td className="text-xs text-muted">{r.current_impl}</Td>
                  <Td className="text-xs">{r.risk}</Td>
                  <Td className="text-xs">{r.recommended}</Td>
                  <Td>
                    <Badge tone={sotTone(r.status)}>{r.status}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      </section>

      <section>
        <Kicker>Kill / keep / evolve</Kicker>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-danger">Kill</h3>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
              {kill.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-acid">Keep</h3>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
              {keep.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-info">Evolve</h3>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
              {evolve.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <Kicker>90-day roadmap</Kicker>
        <ol className="mt-3 space-y-3">
          {roadmap.map((r) => (
            <li key={r.item} className="rounded-lg border border-line bg-surface p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-faint">
                {r.when} · {r.owner}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">{r.item}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
