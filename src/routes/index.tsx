import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ActionCard } from "@/components/mc/action-card";
import { Badge, Empty, healthTone, Kicker, Metric, PageHead, Panel, Pending, Provenance } from "@/components/mc/ui";
import { getOverview } from "@/lib/mc/queries";
import { formatIst, formatPaise } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: () => getOverview(),
  pendingComponent: Pending,
  component: Attention,
});

const CHART = { booked: "#8ec8ff", realised: "#b8ff57", grid: "#2a2c2a", tick: "#6b6b66" };

function Attention() {
  const data = Route.useLoaderData();
  const { pulse, actions, incidents, health, facts } = data;

  return (
    <div className="space-y-8">
      <PageHead
        kicker="Mission Control"
        title="What needs attention"
        aside={<Provenance>{data.provenance}</Provenance>}
      />

      <section className="space-y-3">
        <Kicker>Ranked actions</Kicker>
        {actions.length === 0 ? (
          <Empty title="Nothing open" body="Handled, snoozed, or expired work stays in audit — not on this list." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {actions.map((a) => (
              <ActionCard key={a.id} action={a} />
            ))}
          </div>
        )}
      </section>

      <section>
        <Kicker>Business pulse</Kicker>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Booked today"
            value={formatPaise(pulse.bookedToday)}
            hint={`${pulse.ordersToday} orders · ${formatPaise(pulse.bookedDelta)} vs yesterday`}
            provenance="PROVEN · IST calendar day · ex-cancelled amount_paise"
          />
          <Metric
            label="Realised today"
            value={formatPaise(pulse.realisedToday)}
            hint="Prepaid unverified + COD uncollected = 0"
            provenance="Delivered / captured in this IST day — none yet"
          />
          <Metric
            label="Pending UPI"
            value={`${pulse.pendingUpiCount}`}
            hint={formatPaise(pulse.pendingUpiPaise)}
            provenance="PROVEN · orders.status = upi_pending"
          />
          <Metric
            label="ATP cover"
            value={`${pulse.coverDays}d`}
            hint={`${pulse.sellable} units · ${pulse.demandDaily}/day assumed`}
            provenance={pulse.demandProvenance}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          Sessions today: {pulse.sessionsToday == null ? "DATA UNAVAILABLE — analytics day not closed" : String(pulse.sessionsToday)}.
          Ad spend today: DATA UNAVAILABLE — platforms not connected (DEMO placeholder is not spend).
        </p>
      </section>

      <Panel className="p-4">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <Kicker>Booked vs realised · 8 days</Kicker>
          <Provenance>daily_facts · DEMO through 15 Sep · 16 Sep DETECTED</Provenance>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={facts} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <Kicker>Open incidents</Kicker>
            <Link to="/incidents" className="text-sm text-info">
              Playbook
            </Link>
          </div>
          <div className="space-y-2">
            {incidents.map((inc) => (
              <Link
                key={inc.id}
                to="/incidents"
                className="block rounded-md border border-line bg-surface p-4 hover:border-line-strong"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={inc.severity === "critical" ? "danger" : "warn"}>{inc.severity}</Badge>
                  <span className="font-mono text-xs text-muted">{inc.code}</span>
                </div>
                <p className="mt-2 text-sm font-medium">{inc.title}</p>
                <p className="mt-1 text-xs text-muted">Last seen {formatIst(inc.last_seen_at)}</p>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <Kicker>Health</Kicker>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {health.map((h) => (
              <div key={h.id} className="rounded-md border border-line bg-surface p-3">
                <Badge tone={healthTone(h.state)}>{h.state}</Badge>
                <p className="mt-2 text-sm font-medium">{h.service}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-faint">{h.evidence}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
