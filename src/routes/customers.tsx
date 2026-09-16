import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, PageHead, Pending, Provenance, Td, Th } from "@/components/mc/ui";
import { getCustomers } from "@/lib/mc/queries";
import { formatIstDate, formatPaise } from "@/lib/utils";

export const Route = createFileRoute("/customers")({
  loader: () => getCustomers(),
  pendingComponent: Pending,
  component: CustomersPage,
});

type Row = {
  id: string;
  display_code: string;
  city: string | null;
  state: string | null;
  phone_masked: string | null;
  email_masked: string | null;
  order_count: number;
  rto_count: number;
  cancelled_count: number;
  lifetime_revenue_paise: number;
  acquisition_source: string | null;
  predicted_reorder_on: string | null;
  last_order_at: string | null;
};

function CustomersPage() {
  const data = Route.useLoaderData();
  const rows = data.rows as Row[];

  return (
    <div>
      <PageHead kicker="Customers" title="Index" aside={<Provenance>{data.provenance}</Provenance>} />
      <p className="mb-4 text-sm text-muted">
        Identity is a display code + masked phone/email. Predicted reorder is an INFERRED ~20-day heuristic, not a
        survival model. Lifetime ₹ is sum of product_paise on non-cancelled DEMO orders — not contribution LTV.
      </p>
      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[920px] border-collapse">
          <thead className="bg-surface-2">
            <tr>
              <Th>Code</Th>
              <Th>City</Th>
              <Th>Contact</Th>
              <Th>Orders</Th>
              <Th>RTO</Th>
              <Th>Lifetime ₹</Th>
              <Th>Source</Th>
              <Th>Reorder</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-line hover:bg-surface-2/60">
                <Td>
                  <Link to="/customers/$id" params={{ id: c.id }} className="font-mono text-info">
                    {c.display_code}
                  </Link>
                </Td>
                <Td>
                  {c.city}
                  {c.state ? `, ${c.state}` : ""}
                </Td>
                <Td className="text-muted">
                  {c.phone_masked}
                  <div className="text-[11px]">{c.email_masked}</div>
                </Td>
                <Td className="font-mono tabular">{c.order_count}</Td>
                <Td className="font-mono tabular">{c.rto_count}</Td>
                <Td className="font-mono tabular">{formatPaise(Number(c.lifetime_revenue_paise))}</Td>
                <Td className="text-muted">{c.acquisition_source ?? "—"}</Td>
                <Td>
                  {c.predicted_reorder_on ? (
                    <Badge tone="warn">{formatIstDate(c.predicted_reorder_on)} · INFERRED</Badge>
                  ) : (
                    <span className="text-faint">—</span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
