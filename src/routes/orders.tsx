import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge, Kicker, orderTone, PageHead, Pending, Provenance, Td, Th } from "@/components/mc/ui";
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
        aside={<Provenance>{provenance} · catalog SKU OS-001-50ML</Provenance>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`h-10 rounded-sm px-3 text-sm ${filter === f.id ? "bg-acid text-acid-fg" : "border border-line bg-surface text-muted"}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <Kicker>
        {shown.length} of {rows.length}
      </Kicker>
      <div className="mt-3 overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[880px] border-collapse">
          <thead className="bg-surface-2">
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
        </table>
      </div>
    </div>
  );
}
