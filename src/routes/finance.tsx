import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Kicker, Metric, PageHead, Panel, Pending, Provenance } from "@/components/mc/ui";
import { getFinance } from "@/lib/mc/queries";
import { formatPaise } from "@/lib/utils";

export const Route = createFileRoute("/finance")({
  loader: () => getFinance(),
  pendingComponent: Pending,
  component: FinancePage,
});

const CHART = { booked: "#8ec8ff", realised: "#b8ff57", tick: "#6b6b66" };

function FinancePage() {
  const data = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <PageHead kicker="Finance" title="Booked is not realised" aside={<Provenance>DEMO ledger · IST</Provenance>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Metric label="Booked (ex-cancelled)" value={formatPaise(data.booked)} provenance="sum(amount_paise) status ≠ cancelled" />
        <Metric label="Realised (delivered)" value={formatPaise(data.realised)} provenance="sum(product_paise) status = delivered" />
        <Metric label="Pending UPI" value={formatPaise(data.pendingSettlements)} provenance="status = upi_pending" />
        <Metric label="Refund exposure" value={formatPaise(data.refundExposure)} provenance="payment_status = refund_due" />
        <Metric label="RTO exposure" value={formatPaise(data.rtoExposure)} provenance="status = rto · amount includes COD fee" />
        <Metric
          label="Ad spend"
          value="DATA UNAVAILABLE"
          hint={data.adSpendNote}
          provenance="Ad platforms not connected"
        />
      </div>

      <Panel className="p-4">
        <Kicker>Contribution (narrow)</Kicker>
        <p className="mt-2 font-mono text-2xl tabular">{formatPaise(data.contributionPaise)}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{data.contributionNote}</p>
        <p className="mt-2 text-xs text-warn">
          COGS {formatPaise(data.cogsPerUnitPaise)}/unit — {data.cogsNote}
        </p>
      </Panel>

      <Panel className="p-4">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <Kicker>Booked vs realised</Kicker>
          <Provenance>daily_facts · do not chart ad_spend as fact</Provenance>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.facts}>
              <XAxis dataKey="day" tick={{ fill: CHART.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: CHART.tick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `₹${Math.round(v / 100)}`}
              />
              <Tooltip
                contentStyle={{ background: "#141514", border: "1px solid #2a2c2a", fontSize: 12 }}
                formatter={(v) => formatPaise(Number(v))}
              />
              <Area type="monotone" dataKey="booked_paise" name="Booked" stroke={CHART.booked} fill={CHART.booked} fillOpacity={0.12} />
              <Area type="monotone" dataKey="realised_paise" name="Realised" stroke={CHART.realised} fill={CHART.realised} fillOpacity={0.18} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
