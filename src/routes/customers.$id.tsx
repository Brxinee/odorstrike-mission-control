import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Empty, Kicker, orderTone, PageHead, Panel, Pending, Provenance, Td, Th } from "@/components/mc/ui";
import { getCustomer } from "@/lib/mc/queries";
import { PLANNING } from "@/lib/mc/commerce";
import { formatIst, formatIstDate, formatPaise } from "@/lib/utils";

export const Route = createFileRoute("/customers/$id")({
  loader: ({ params }) => getCustomer({ data: { id: params.id } }),
  pendingComponent: Pending,
  component: CustomerPage,
});

function CustomerPage() {
  const { id } = Route.useParams();
  const data = Route.useLoaderData();
  const c = data.customer as Record<string, unknown> | null;
  if (!c) {
    return (
      <div>
        <PageHead kicker="Customer" title={id} />
        <Empty title="Not in this ledger" body="Unknown customer id." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHead
        kicker="Customer 360"
        title={String(c.display_code)}
        aside={<Provenance>DEMO · masked identity</Provenance>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="p-4">
          <Kicker>Where</Kicker>
          <p className="mt-2 text-sm">
            {String(c.city)}, {String(c.state)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {String(c.phone_masked)} · {String(c.email_masked)}
          </p>
        </Panel>
        <Panel className="p-4">
          <Kicker>Lifetime product ₹</Kicker>
          <p className="mt-2 font-mono text-xl tabular">{formatPaise(Number(c.lifetime_revenue_paise))}</p>
          <Provenance>Not contribution LTV</Provenance>
        </Panel>
        <Panel className="p-4">
          <Kicker>Behaviour</Kicker>
          <p className="mt-2 text-sm">
            {String(c.order_count)} orders · {String(c.rto_count)} RTO · {String(c.cancelled_count)} cancelled
          </p>
        </Panel>
        <Panel className="p-4">
          <Kicker>Predicted reorder</Kicker>
          <p className="mt-2 text-sm">
            {c.predicted_reorder_on ? formatIstDate(String(c.predicted_reorder_on)) : "No window"}
          </p>
          <Provenance>{PLANNING.reorderCycleProvenance}</Provenance>
        </Panel>
      </div>
      <Panel className="p-4">
        <Kicker>Acquisition</Kicker>
        <p className="mt-2 text-sm">
          {String(c.acquisition_source ?? "unknown")} / {String(c.acquisition_medium ?? "—")} /{" "}
          {String(c.acquisition_campaign ?? "—")}
        </p>
      </Panel>
      <section>
        <Kicker>Orders</Kicker>
        <div className="mt-3 overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="bg-surface-2">
              <tr>
                <Th>Order</Th>
                <Th>Status</Th>
                <Th>Pay</Th>
                <Th>Amount</Th>
                <Th>Placed</Th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr key={o.id} className="border-t border-line">
                  <Td>
                    <Link to="/orders/$code" params={{ code: o.order_code }} className="font-mono text-info">
                      {o.order_code}
                    </Link>
                  </Td>
                  <Td>
                    <Badge tone={orderTone(o.status)}>{o.status}</Badge>
                  </Td>
                  <Td className="text-muted">
                    {o.payment_method} · {o.payment_status}
                  </Td>
                  <Td className="font-mono">{formatPaise(o.amount_paise)}</Td>
                  <Td className="text-muted">{formatIst(o.placed_at)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
