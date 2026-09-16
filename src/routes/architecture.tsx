import { createFileRoute } from "@tanstack/react-router";
import { Badge, Kicker, PageHead, Panel, Pending, Td, Th } from "@/components/mc/ui";
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
      <PageHead kicker="Phase 0" title="Architecture maps" />
      <p className="max-w-3xl text-sm leading-6 text-muted">
        Required before large code in the two production repos. This screen is the living map. Production cannot be
        DDL’d from here. Smelloff @ c1a4e21 · Admin @ 17fd2d6.
      </p>

      {Object.entries(maps).map(([key, section]) => (
        <section key={key}>
          <Kicker>
            Map {key}
          </Kicker>
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
        <div className="mt-3 overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[960px] border-collapse">
            <thead className="bg-surface-2">
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
                <tr key={r.fact} className="border-t border-line align-top">
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
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-4">
          <Kicker>Kill</Kicker>
          <ul className="mt-3 space-y-2">
            {kill.map((x) => (
              <li key={x} className="text-sm leading-5 text-muted">
                {x}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="p-4">
          <Kicker>Keep</Kicker>
          <ul className="mt-3 space-y-2">
            {keep.map((x) => (
              <li key={x} className="text-sm leading-5 text-muted">
                {x}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="p-4">
          <Kicker>Evolve</Kicker>
          <ul className="mt-3 space-y-2">
            {evolve.map((x) => (
              <li key={x} className="text-sm leading-5 text-muted">
                {x}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <section>
        <Kicker>90-day ranked roadmap</Kicker>
        <ol className="mt-3 space-y-2">
          {roadmap.map((r) => (
            <li key={r.when} className="rounded-md border border-line bg-surface p-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-xs text-acid">{r.when}</span>
                <span className="text-xs text-faint">{r.owner}</span>
              </div>
              <p className="mt-1 text-sm leading-6">{r.item}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
