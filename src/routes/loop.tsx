import { createFileRoute } from "@tanstack/react-router";
import { Badge, Kicker, Metric, PageHead, Panel, Pending, Provenance } from "@/components/mc/ui";
import { getLoop } from "@/lib/mc/queries";
import { formatPaise } from "@/lib/utils";

export const Route = createFileRoute("/loop")({
  loader: () => getLoop(),
  pendingComponent: Pending,
  component: LoopPage,
});

function LoopPage() {
  const data = Route.useLoaderData();
  const s = data.storefront;

  return (
    <div className="space-y-8">
      <PageHead
        kicker="Storefront loop"
        title="Hypothesis → change → measure → decide"
        desc="No random UI change. Experiments may not invent claims or touch ₹229 / ₹60 COD / SKU."
        aside={<Provenance>{data.provenance}</Provenance>}
      />

      <Panel className="p-4">
        <Kicker>Locked commercial truth</Kicker>
        <p className="mt-2 text-sm leading-6">
          {s.sku} · {formatPaise(s.pricePaise)} prepaid · COD fee {formatPaise(s.codFeePaise)} ·{" "}
          <a href={s.url} className="text-info underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
            smelloff.in
          </a>
        </p>
        <p className="mt-2 text-sm text-muted">{s.claim}</p>
        <p className="mt-2 text-xs text-warn">Out of scope: {s.outOfScope.join(", ")}. Experiments may not invent claims.</p>
      </Panel>

      <section>
        <Kicker>Funnel (fail closed)</Kicker>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {data.funnel.map((f) => (
            <Panel key={f.stage} className="p-4">
              <Kicker>{f.stage}</Kicker>
              <p className="mt-2 font-mono text-sm">{f.metric}</p>
              <p className="mt-2 text-xs leading-5 text-muted">{f.note}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section>
        <Kicker>Experiment register</Kicker>
        <div className="mt-3 space-y-3">
          {data.experiments.map((e) => (
            <Panel key={e.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={e.status === "blocked" ? "danger" : e.status === "queued" ? "warn" : "acid"}>
                  {e.status}
                </Badge>
                <span className="font-mono text-[11px] text-muted">{e.id}</span>
                <span className="text-xs text-muted">{e.result}</span>
              </div>
              <p className="mt-3 text-sm font-medium leading-6">{e.hypothesis}</p>
              <dl className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
                <div>
                  <span className="text-faint">Audience · </span>
                  {e.audience}
                </div>
                <div>
                  <span className="text-faint">Metric · </span>
                  {e.metric}
                </div>
                <div>
                  <span className="text-faint">Baseline · </span>
                  {e.baseline}
                </div>
                <div>
                  <span className="text-faint">Decision · </span>
                  {e.decision}
                </div>
              </dl>
              <p className="mt-3 text-xs leading-5 text-faint">Baymard: {e.baymard}</p>
            </Panel>
          ))}
        </div>
      </section>

      <Metric
        label="Random UI changes"
        value="Forbidden"
        provenance="No experiment without hypothesis, audience, metric, baseline."
      />
    </div>
  );
}
