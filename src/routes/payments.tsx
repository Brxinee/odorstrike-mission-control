import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Btn, orderTone, PageHead, Pending, Provenance, Td, Th } from "@/components/mc/ui";
import { getPayments, verifyAllPending, verifyPayment } from "@/lib/mc/queries";
import { ageLabel, formatIst, formatPaise } from "@/lib/utils";

export const Route = createFileRoute("/payments")({
  loader: () => getPayments(),
  pendingComponent: Pending,
  component: PaymentsPage,
});

function PaymentsPage() {
  const { rows } = Route.useLoaderData();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function verifyOne(id: string) {
    setBusy(id);
    try {
      const res = await verifyPayment({ data: { paymentId: id } });
      if (!res.ok) toast.error(res.error);
      else toast.success(`DEMO captured ${formatPaise(res.amountPaise)}. Production = Admin UTR / Razorpay webhook.`);
      await router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function verifyAll() {
    setBusy("all");
    try {
      const res = await verifyAllPending();
      toast.success(`DEMO: ${res.count} captured · ${formatPaise(res.releasedPaise)}`);
      await router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  const pending = rows.filter((r) => r.status === "pending_verify").length;

  return (
    <div>
      <PageHead
        kicker="Payments"
        title="Money in the ledger"
        aside={
          pending ? (
            <Btn variant="primary" disabled={busy !== null} onClick={() => void verifyAll()}>
              Verify all pending ({pending})
            </Btn>
          ) : null
        }
      />
      <p className="mb-4 text-sm text-muted">
        DEMO verify marks captured in this ledger only. Live prepaid source of truth is Razorpay{" "}
        <span className="font-mono">payment.captured</span>. Refunds stay in production Admin — handle the action when
        the payout is actually sent.
      </p>
      <Provenance>payments ⋈ orders · integer paise</Provenance>
      <div className="mt-3 overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[880px] border-collapse">
          <thead className="bg-surface-2">
            <tr>
              <Th>Payment</Th>
              <Th>Method</Th>
              <Th>Status</Th>
              <Th>Amount</Th>
              <Th>UTR</Th>
              <Th>Age</Th>
              <Th>Created</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <Td>
                  <Link to="/payments/$id" params={{ id: p.id }} className="font-mono text-info">
                    {p.id}
                  </Link>
                  <div>
                    <Link to="/orders/$code" params={{ code: p.order_code }} className="font-mono text-[11px] text-muted">
                      {p.order_code}
                    </Link>
                  </div>
                </Td>
                <Td>{p.method}</Td>
                <Td>
                  <Badge tone={orderTone(p.status)}>{p.status}</Badge>
                </Td>
                <Td className="font-mono tabular">{formatPaise(p.amount_paise)}</Td>
                <Td className="font-mono text-muted">{p.utr_masked ?? "—"}</Td>
                <Td className="text-muted">{p.age_minutes != null ? ageLabel(p.age_minutes) : "—"}</Td>
                <Td className="whitespace-nowrap text-muted">{formatIst(p.created_at)}</Td>
                <Td>
                  {p.status === "pending_verify" ? (
                    <Btn disabled={busy !== null} onClick={() => void verifyOne(p.id)}>
                      Verify
                    </Btn>
                  ) : p.status === "refund_due" ? (
                    <span className="text-xs text-warn">Production refund only</span>
                  ) : null}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
