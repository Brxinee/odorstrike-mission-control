import { createFileRoute } from "@tanstack/react-router";
import { Metric, PageHead, Pending, Provenance, TableWrap, Td, Th } from "@/components/mc/ui";
import { getMarketing } from "@/lib/mc/queries";
import { formatPaise } from "@/lib/utils";

export const Route = createFileRoute("/marketing")({
  loader: () => getMarketing(),
  pendingComponent: Pending,
  component: MarketingPage,
});

function MarketingPage() {
  const data = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <PageHead
        kicker="Marketing"
        title="Attribution without fiction"
        desc="No CAC without ad spend. No repeat rate from a 12-order sample. Source/medium is on the order row — not a modeled path."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="CAC" value="DATA UNAVAILABLE" hint={data.cacNote} provenance="No live ad spend" />
        <Metric
          label="Repeat rate"
          value="DATA UNAVAILABLE"
          hint={data.repeatRateNote}
          provenance="Sample too small"
        />
      </div>
      <Provenance>Grouped from DEMO orders.source / medium · revenue = product_paise</Provenance>
      <TableWrap minClass="min-w-[640px]">
        <thead>
          <tr>
            <Th>Source</Th>
            <Th>Medium</Th>
            <Th>Orders</Th>
            <Th>Booked product ₹</Th>
            <Th>Realised</Th>
            <Th>RTO</Th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={`${r.source}-${r.medium}`} className="border-t border-line hover:bg-surface-2/60">
              <Td>{r.source}</Td>
              <Td>{r.medium}</Td>
              <Td className="font-mono tabular">{r.orders}</Td>
              <Td className="font-mono tabular">{formatPaise(r.revenue)}</Td>
              <Td className="font-mono tabular">{formatPaise(r.realised)}</Td>
              <Td className="font-mono tabular">{r.rto}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}
