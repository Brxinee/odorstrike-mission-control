import { createFileRoute } from "@tanstack/react-router";
import { Badge, Kicker, PageHead, Panel, Pending, Provenance, Td, Th } from "@/components/mc/ui";
import { BRAND, PRODUCT, RETURNS, SHIPPING } from "@/lib/mc/commerce";
import { getAudit } from "@/lib/mc/queries";
import { formatIst } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  loader: () => getAudit(),
  pendingComponent: Pending,
  component: SettingsPage,
});

function SettingsPage() {
  const { rows } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHead kicker="Settings" title="Commercial constitution" />

      <Panel className="p-4">
        <Kicker>Brand</Kicker>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>Legal · {BRAND.legalName}</div>
          <div>Founder · {BRAND.founder}</div>
          <div>
            Origin · {BRAND.city}, {BRAND.state}
          </div>
          <div>Support · {BRAND.supportEmail}</div>
          <div>Store · {BRAND.website}</div>
          <div>Admin · {BRAND.admin}</div>
        </dl>
      </Panel>

      <Panel className="p-4">
        <Kicker>SKU / price — do not silent-edit</Kicker>
        <ul className="mt-3 space-y-1 text-sm leading-6">
          <li>
            Catalog SKU <span className="font-mono">{PRODUCT.catalogSku}</span> · alias{" "}
            <span className="font-mono">{PRODUCT.operatorAlias}</span>
          </li>
          <li>
            ₹{PRODUCT.pricePaise / 100} prepaid · MRP ₹{PRODUCT.mrpPaise / 100} · COD fee ₹{PRODUCT.codFeePaise / 100} ·
            collectable ₹{PRODUCT.priceCodPaise / 100}
          </li>
          <li>{PRODUCT.claim}</li>
          <li>In scope: {PRODUCT.inScope.join(", ")}</li>
          <li>Out of scope: {PRODUCT.outOfScope.join(", ")}</li>
          <li className="text-warn">{PRODUCT.skuConflict}</li>
          <li className="text-danger">Never publish: {PRODUCT.neverPublish}</li>
        </ul>
      </Panel>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel className="p-4">
          <Kicker>Shipping</Kicker>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            <li>{SHIPPING.prepaid}</li>
            <li>{SHIPPING.cod}</li>
            <li>Dispatch {SHIPPING.dispatch}</li>
            <li>Metros {SHIPPING.transitMetros}</li>
            <li>Tier-2/3 {SHIPPING.transitTier23}</li>
          </ul>
        </Panel>
        <Panel className="p-4">
          <Kicker>Returns</Kicker>
          <p className="mt-3 text-sm text-muted">
            {RETURNS.windowDays} days · {RETURNS.condition}
          </p>
        </Panel>
      </div>

      <Panel className="p-4">
        <Kicker>This instance vs production</Kicker>
        <p className="mt-2 text-sm leading-6 text-muted">
          Preview Auth is OFF (unowned DEMO rows). Production Admin already has HttpOnly cookies, CSRF, TOTP, RBAC.
          Do not copy session tokens here. Database is ON (PGLite in preview, Neon on deploy). Side effects that send
          mail or capture money stay in Brxinee/Smelloff and Brxinee/Admin.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="warn">Auth off</Badge>
          <Badge tone="acid">Database on</Badge>
          <Badge>IST</Badge>
          <Badge>paise</Badge>
        </div>
      </Panel>

      <section>
        <Kicker>Audit log</Kicker>
        <Provenance>Last 60 rows · this ledger</Provenance>
        <div className="mt-3 overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[720px] border-collapse">
            <thead className="bg-surface-2">
              <tr>
                <Th>When</Th>
                <Th>Actor</Th>
                <Th>Action</Th>
                <Th>Entity</Th>
                <Th>Result</Th>
                <Th>Req</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <Td className="whitespace-nowrap text-muted">{formatIst(r.created_at)}</Td>
                  <Td>{r.actor}</Td>
                  <Td className="font-mono text-xs">{r.action}</Td>
                  <Td className="font-mono text-xs">
                    {r.entity_type}:{r.entity_id}
                  </Td>
                  <Td>{r.result}</Td>
                  <Td className="font-mono text-[11px] text-faint">{r.request_id}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
