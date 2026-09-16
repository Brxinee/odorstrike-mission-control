import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge, Chip, Empty, orderTone, PageHead, Pending, Provenance, TableWrap, Td, Th } from "@/components/mc/ui";
import { getOrders } from "@/lib/mc/queries";
import { formatIst, formatPaise } from "@/lib/utils";

export const Route = createFileRoute("/orders")({
  loader: () => getOrders(),
  pendingComponent: Pending,
  component: OrdersPage,
});

const FILTERS = [
  { id: "all", label: "All" },
  { id: "upi_pending", label: "UPI pending" },
  { id: "confirmed", label: "To pack" },
  { id: "dispatched", label: "Shipped" },
  { id: "out_for_delivery", label: "Out" },
  { id: "delivered", label: "Delivered" },
  { id: "rto", label: "RTO" },
  { id: "cancelled", label: "Cancelled" },
] as const;

function OrdersPage() {
  const { rows, provenance } = Route.useLoaderData();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const shown = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  return (
    <div>
      <PageHead
        kicker="Orders"
        title="Index"
        desc="Stripe-style table first. Status is the order row, not a vibe. Catalog SKU OS-001-50ML."
        aside={<Provenance>{provenance}</Provenance>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </Chip>
        ))}
      </div>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-faint">
        {shown.length} of {rows.length}
      </p>
      {shown.length === 0 ? (
        <Empty title="No orders in this filter" body="Clear the chip or wait for the next DEMO placement." />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Status</Th>
              <Th>Pay</Th>
              <Th>Qty</Th>
              <Th>Amount</Th>
              <Th>City</Th>
              <Th>Source</Th>
              <Th>Placed</Th>
            </tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id} className="border-t border-line hover:bg-surface-2/60">
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
                <Td className="font-mono tabular">{o.qty}</Td>
                <Td className="font-mono tabular">{formatPaise(o.amount_paise)}</Td>
                <Td>
                  {o.city}
                  {o.state ? `, ${o.state}` : ""}
                </Td>
                <Td className="text-muted">
                  {o.source}/{o.medium}
                </Td>
                <Td className="whitespace-nowrap text-muted">{formatIst(o.placed_at)}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
