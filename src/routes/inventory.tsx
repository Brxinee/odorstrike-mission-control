import { createFileRoute } from "@tanstack/react-router";
import { Badge, Kicker, PageHead, Panel, Pending, Provenance, Td, Th } from "@/components/mc/ui";
import { getInventory } from "@/lib/mc/queries";
import { formatIst } from "@/lib/utils";
import { PRODUCT } from "@/lib/mc/commerce";

export const Route = createFileRoute("/inventory")({
  loader: () => getInventory(),
  pendingComponent: Pending,
  component: InventoryPage,
});

const STAGES = [
  "raw_materials",
  "production",
  "finished_goods",
  "sellable",
  "committed",
  "shipped",
  "delivered",
  "rto",
  "damaged",
] as const;

function InventoryPage() {
  const data = Route.useLoaderData();
  const f = data.forecast;

  return (
    <div className="space-y-6">
      <PageHead
        kicker="Inventory"
        title={data.sku}
        aside={<Provenance>Ledger movements · ATP derived</Provenance>}
      />
      <Panel className="p-4">
        <p className="text-sm leading-6 text-muted">{data.skuConflict}</p>
        <p className="mt-2 font-mono text-xs text-faint">
          Catalog {data.sku} · operator alias {data.alias} · {PRODUCT.size}
        </p>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="p-4">
          <Kicker>ATP</Kicker>
          <p className="mt-2 font-mono text-2xl tabular">{data.atp}</p>
          <Provenance>sellable IN + committed net</Provenance>
        </Panel>
        <Panel className="p-4">
          <Kicker>Cover</Kicker>
          <p className="mt-2 font-mono text-2xl tabular">{f.coverDays}d</p>
          <Provenance>ATP ÷ {f.expectedDaily}/day INFERRED</Provenance>
        </Panel>
        <Panel className="p-4">
          <Kicker>Projected stockout</Kicker>
          <p className="mt-2 font-mono text-2xl tabular">{f.projectedStockout}</p>
          <Provenance>today + floor(cover) · IST calendar</Provenance>
        </Panel>
        <Panel className="p-4">
          <Kicker>Recommend produce</Kicker>
          <p className="mt-2 font-mono text-2xl tabular">{f.recommendedProduce}</p>
          <Provenance>ceil(daily × lead + safety − ATP)</Provenance>
        </Panel>
      </div>

      <Panel className="p-4">
        <Kicker>Formula</Kicker>
        <p className="mt-2 font-mono text-sm">{f.formula}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{f.why}</p>
        <p className="mt-2 text-xs text-muted">
          lead {f.leadTimeDays}d · safety {f.safetyStock} · confidence {f.confidence}
        </p>
        <div className="mt-4 rounded-sm border border-line bg-surface-2 p-3">
          <Kicker>Scenario — demand doubles</Kicker>
          <p className="mt-2 text-sm">
            {f.scenarioDoubleDemand.daily}/day → cover {f.scenarioDoubleDemand.coverDays}d · produce{" "}
            {f.scenarioDoubleDemand.recommendedProduce}
          </p>
          <Provenance>{f.scenarioDoubleDemand.note}</Provenance>
        </div>
      </Panel>

      <section>
        <Kicker>Stage nets (one-sided DEMO transfers — not a WMS double-entry)</Kicker>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {STAGES.map((s) => (
            <div key={s} className="rounded-md border border-line bg-surface p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-faint">{s.replaceAll("_", " ")}</p>
              <p className="mt-1 font-mono text-lg tabular">{data.byStage[s] ?? 0}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Kicker>Movements</Kicker>
        <div className="mt-3 overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[800px] border-collapse">
            <thead className="bg-surface-2">
              <tr>
                <Th>When</Th>
                <Th>Stage</Th>
                <Th>Dir</Th>
                <Th>Qty</Th>
                <Th>Reason</Th>
                <Th>Actor</Th>
                <Th>Ref</Th>
              </tr>
            </thead>
            <tbody>
              {data.movements.map((m) => (
                <tr key={m.id} className="border-t border-line">
                  <Td className="whitespace-nowrap text-muted">{formatIst(m.occurred_at)}</Td>
                  <Td>{m.stage}</Td>
                  <Td>
                    <Badge tone={m.direction === "in" ? "acid" : "warn"}>{m.direction}</Badge>
                  </Td>
                  <Td className="font-mono tabular">{m.qty}</Td>
                  <Td>{m.reason}</Td>
                  <Td className="text-muted">{m.actor}</Td>
                  <Td className="font-mono text-muted">{m.ref_code}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
