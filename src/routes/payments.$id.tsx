import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Btn, Empty, Kicker, orderTone, PageHead, Panel, Pending, Provenance } from "@/components/mc/ui";
import { getPayment, verifyPayment } from "@/lib/mc/queries";
import { ageLabel, formatIst, formatPaise } from "@/lib/utils";

export const Route = createFileRoute("/payments/$id")({
  loader: ({ params }) => getPayment({ data: { id: params.id } }),
  pendingComponent: Pending,
  component: PaymentPage,
});

function PaymentPage() {
  const { id } = Route.useParams();
  const { payment, events } = Route.useLoaderData();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!payment) {
    return (
      <div>
        <PageHead kicker="Payment" title={id} />
        <Empty title="Not in this ledger" body="Unknown payment id." />
      </div>
    );
  }

  async function onVerify() {
    setBusy(true);
    try {
      const res = await verifyPayment({ data: { paymentId: payment.id } });
      if (!res.ok) toast.error(res.error);
      else toast.success(`DEMO captured ${formatPaise(res.amountPaise)}. Production = Admin UTR / Razorpay.`);
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
        kicker="Payment"
        title={payment.id}
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={orderTone(payment.status)}>{payment.status}</Badge>
            <Provenance>{payment.gateway ?? payment.method}</Provenance>
          </div>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="p-4">
          <Kicker>Amount</Kicker>
          <p className="mt-2 font-mono text-xl tabular">{formatPaise(payment.amount_paise)}</p>
        </Panel>
        <Panel className="p-4">
          <Kicker>Order</Kicker>
          <Link to="/orders/$code" params={{ code: payment.order_code }} className="mt-2 block font-mono text-sm text-info">
            {payment.order_code}
          </Link>
          <p className="mt-1 text-xs text-muted">{payment.order_status}</p>
        </Panel>
        <Panel className="p-4">
          <Kicker>UTR</Kicker>
          <p className="mt-2 font-mono text-sm">{payment.utr_masked ?? "No UTR"}</p>
        </Panel>
        <Panel className="p-4">
          <Kicker>Age</Kicker>
          <p className="mt-2 text-sm">{payment.age_minutes != null ? ageLabel(payment.age_minutes) : "—"}</p>
          <p className="mt-1 font-mono text-[11px] text-faint">{formatIst(payment.created_at)}</p>
        </Panel>
      </div>
      {payment.status === "pending_verify" ? (
        <Btn variant="primary" disabled={busy} onClick={() => void onVerify()}>
          Verify UPI (DEMO)
        </Btn>
      ) : null}
      {payment.status === "refund_due" ? (
        <p className="text-sm text-warn">Refunds stay in production Admin. This DEMO ledger cannot pay out.</p>
      ) : null}
      <section>
        <Kicker>Related events</Kicker>
        <ol className="mt-3 space-y-2">
          {events.length === 0 ? <p className="text-sm text-muted">No operational events on this order.</p> : null}
          {events.map((e) => (
            <li key={e.id} className="rounded-md border border-line bg-surface p-3">
              <p className="text-sm">{e.title}</p>
              <p className="mt-1 font-mono text-[11px] text-faint">
                {e.event_type} · {formatIst(e.occurred_at)}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
