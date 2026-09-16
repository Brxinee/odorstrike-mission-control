import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Btn, Empty, Kicker, orderTone, PageHead, Panel, Pending, Provenance, Td, Th } from "@/components/mc/ui";
import { getOrder, verifyPayment } from "@/lib/mc/queries";
import { PRODUCT } from "@/lib/mc/commerce";
import { formatIst, formatPaise } from "@/lib/utils";

export const Route = createFileRoute("/orders/$code")({
  loader: ({ params }) => getOrder({ data: { code: params.code } }),
  pendingComponent: Pending,
  component: OrderPage,
});

function asRec(v: unknown) {
  return (v ?? {}) as Record<string, unknown>;
}

function str(v: unknown) {
  return v == null ? null : String(v);
}

function OrderPage() {
  const { code } = Route.useParams();
  const data = Route.useLoaderData();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const order = data.order;

  if (!order) {
    return (
      <div>
        <PageHead kicker="Order" title={code} />
        <Empty title="Not in this ledger" body="DEMO sample only contains seeded SMF codes." />
      </div>
    );
  }

  const customer = asRec(data.customer);
  const payment = asRec(data.payment);
  const events = (data.events ?? []) as Array<Record<string, unknown>>;
  const emails = (data.emails ?? []) as Array<Record<string, unknown>>;
  const related = (data.customerOrders ?? []) as Array<{
    order_code: string;
    status: string;
    amount_paise: number;
    placed_at: string;
  }>;

  async function onVerify() {
    const id = str(payment.id);
    if (!id) return;
    setBusy(true);
    try {
      const res = await verifyPayment({ data: { paymentId: id } });
      if (!res.ok) toast.error(res.error);
      else toast.success(`DEMO captured ${formatPaise(res.amountPaise)}. Production verify is Admin UTR / Razorpay.`);
      await router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verify failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHead
        kicker="Order"
        title={order.order_code}
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={orderTone(order.status)}>{order.status}</Badge>
            <Provenance>{order.provenance}</Provenance>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="p-4">
          <Kicker>Amount</Kicker>
          <p className="mt-2 font-mono text-xl tabular">{formatPaise(order.amount_paise)}</p>
          <p className="mt-1 text-xs text-muted">
            {order.qty} × {formatPaise(PRODUCT.pricePaise)}
            {order.cod_fee_paise ? ` + COD ${formatPaise(order.cod_fee_paise)}` : " · prepaid"}
          </p>
        </Panel>
        <Panel className="p-4">
          <Kicker>Payment</Kicker>
          <p className="mt-2 text-sm">
            {order.payment_method} · {order.payment_status}
          </p>
          <p className="mt-1 font-mono text-xs text-muted">{str(payment.utr_masked) ?? "No UTR"}</p>
          {str(payment.status) === "pending_verify" ? (
            <Btn className="mt-3" variant="primary" disabled={busy} onClick={() => void onVerify()}>
              Verify UPI (DEMO)
            </Btn>
          ) : null}
        </Panel>
        <Panel className="p-4">
          <Kicker>Fulfillment</Kicker>
          <p className="mt-2 text-sm">{order.fulfillment_status}</p>
          <p className="mt-1 text-xs text-muted">
            {order.courier ?? "No courier"} · {order.awb ?? "No AWB"}
          </p>
        </Panel>
        <Panel className="p-4">
          <Kicker>Customer</Kicker>
          {order.customer_id ? (
            <Link to="/customers/$id" params={{ id: order.customer_id }} className="mt-2 block text-sm text-info">
              {str(customer.display_code) ?? order.customer_id}
            </Link>
          ) : (
            <p className="mt-2 text-sm">Unknown</p>
          )}
          <p className="mt-1 text-xs text-muted">
            {order.city}, {order.state}
          </p>
        </Panel>
      </div>

      <Panel className="p-4">
        <Kicker>Attribution</Kicker>
        <p className="mt-2 text-sm">
          {order.source} / {order.medium} / {order.campaign ?? "—"} · {order.device} · SKU {order.sku}
        </p>
        <Provenance>UTM on the order row — not a modeled conversion path</Provenance>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <section>
          <Kicker>Timeline</Kicker>
          <ol className="mt-3 space-y-2">
            {events.length === 0 ? <p className="text-sm text-muted">No operational events for this code.</p> : null}
            {events.map((e) => (
              <li key={String(e.id)} className="rounded-md border border-line bg-surface p-3">
                <div className="flex items-center gap-2">
                  <Badge>{String(e.severity)}</Badge>
                  <span className="text-sm">{String(e.title)}</span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-faint">{formatIst(String(e.occurred_at))}</p>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <Kicker>Communication</Kicker>
          <div className="mt-3 space-y-2">
            {emails.length === 0 ? (
              <p className="text-sm text-muted">No email_events for this order in the DEMO ledger.</p>
            ) : null}
            {emails.map((em, i) => (
              <div key={i} className="rounded-md border border-line bg-surface p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={orderTone(String(em.status))}>{String(em.status)}</Badge>
                  <span className="text-sm">{String(em.email_type)}</span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-faint">{String(em.idempotency_key)}</p>
                {em.error_message ? <p className="mt-1 text-xs text-danger">{String(em.error_message)}</p> : null}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section>
        <Kicker>Other orders for this customer</Kicker>
        <div className="mt-3 overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[520px] border-collapse">
            <thead className="bg-surface-2">
              <tr>
                <Th>Order</Th>
                <Th>Status</Th>
                <Th>Amount</Th>
                <Th>Placed</Th>
              </tr>
            </thead>
            <tbody>
              {related.map((r) => (
                <tr key={r.order_code} className="border-t border-line">
                  <Td>
                    <Link to="/orders/$code" params={{ code: r.order_code }} className="font-mono text-info">
                      {r.order_code}
                    </Link>
                  </Td>
                  <Td>
                    <Badge tone={orderTone(r.status)}>{r.status}</Badge>
                  </Td>
                  <Td className="font-mono">{formatPaise(r.amount_paise)}</Td>
                  <Td className="text-muted">{formatIst(r.placed_at)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
