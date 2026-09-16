import { createFileRoute } from "@tanstack/react-router";
import { Badge, Empty, Kicker, Metric, PageHead, Panel, Pending, Provenance, TableWrap, Td, Th } from "@/components/mc/ui";
import { getCarts } from "@/lib/mc/queries";
import { formatIst, formatPaise } from "@/lib/utils";

export const Route = createFileRoute("/carts")({
  loader: () => getCarts(),
  pendingComponent: Pending,
  component: CartsPage,
});

function CartsPage() {
  const data = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <PageHead
        kicker="Carts"
        title="Inactive, not yet orders"
        desc="Ledger-backed DEMO carts. Recovery mail stays blocked while production email_events is SCHEMA_MISMATCH."
        aside={<Provenance>{data.provenance}</Provenance>}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric
          label="Open carts"
          value={`${data.openCount}`}
          hint={formatPaise(data.openPaise)}
          provenance="carts.converted_order_code is null"
        />
        <Metric
          label="Recovery mail"
          value="BLOCKED"
          hint={data.sendBlockedWhy}
          provenance="P0 email_events SCHEMA_MISMATCH"
        />
      </div>
      <Panel className="border-warn/40 p-4">
        <Kicker>Guardrail</Kicker>
        <p className="mt-2 text-sm leading-6 text-muted">{data.sendBlockedWhy}</p>
        <p className="mt-2 text-xs text-warn">
          Do not fire a reminder from this screen. Channel = email. Cooldown 24h. Suppress after conversion.
        </p>
      </Panel>
      {data.rows.length === 0 ? (
        <Empty title="No carts in this ledger" body="DEMO sample is empty or the carts table is not migrated yet." />
      ) : (
        <TableWrap minClass="min-w-[720px]">
          <thead>
            <tr>
              <Th>Cart</Th>
              <Th>Email</Th>
              <Th>Qty</Th>
              <Th>Product ₹</Th>
              <Th>Last activity</Th>
              <Th>State</Th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <Td className="font-mono">{c.id}</Td>
                <Td>
                  {c.email_masked ?? "—"}{" "}
                  {c.email_verified ? <Badge tone="acid">verified</Badge> : <Badge>unverified</Badge>}
                </Td>
                <Td className="font-mono tabular">{c.qty}</Td>
                <Td className="font-mono tabular">{formatPaise(c.product_paise)}</Td>
                <Td className="text-muted">{formatIst(c.last_activity_at)}</Td>
                <Td>
                  {c.converted_order_code ? (
                    <span className="font-mono text-xs">{c.converted_order_code}</span>
                  ) : (
                    <Badge tone="warn">open</Badge>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
