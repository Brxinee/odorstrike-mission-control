import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Empty, PageHead, Pending, Provenance, TableWrap, Td, Th, rowActivate } from "@/components/mc/ui";
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
  const navigate = useNavigate();

  return (
    <div>
      <PageHead
        kicker="Customers"
        title="Index"
        desc="Identity is a display code + masked phone/email. Predicted reorder is an INFERRED ~20-day heuristic — not a survival model. Lifetime ₹ is not contribution LTV."
        aside={<Provenance>{data.provenance}</Provenance>}
      />
      {rows.length === 0 ? (
        <Empty title="No customers in this ledger" body="DEMO sample is empty." />
      ) : (
      <TableWrap minClass="min-w-[920px]">
        <thead>
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
            <tr
              key={c.id}
              className="mc-row border-t border-line"
              tabIndex={0}
              onClick={(e) => rowActivate(e, () => void navigate({ to: "/customers/$id", params: { id: c.id } }))}
              onKeyDown={(e) => rowActivate(e, () => void navigate({ to: "/customers/$id", params: { id: c.id } }))}
            >
              <Td className="font-mono text-info">{c.display_code}</Td>
              <Td>
                {c.city}
                {c.state ? `, ${c.state}` : ""}
              </Td>
              <Td className="text-muted">
                {c.phone_masked}
                <div className="text-xs">{c.email_masked}</div>
              </Td>
              <Td className="font-mono tabular">{c.order_count}</Td>
              <Td className="font-mono tabular">{c.rto_count}</Td>
              <Td className="font-mono tabular">{formatPaise(c.lifetime_revenue_paise)}</Td>
              <Td className="text-muted">{c.acquisition_source ?? "—"}</Td>
              <Td className="whitespace-nowrap text-muted">
                {c.predicted_reorder_on ? formatIstDate(c.predicted_reorder_on) : "—"}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      )}
    </div>
  );
}
