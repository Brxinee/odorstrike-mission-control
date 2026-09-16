import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Kicker, PageHead, Panel, Pending } from "@/components/mc/ui";
import { BRAND, PRODUCT, RETURNS, SHIPPING } from "@/lib/mc/commerce";

export const Route = createFileRoute("/settings")({
  pendingComponent: Pending,
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHead
        kicker="Settings"
        title="Commercial constitution"
        desc="These numbers do not change from this screen. Audit lives on Activity. Production login/TOTP stays on admin.smelloff.in."
      />

      <Panel className="p-5">
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

      <Panel className="p-5">
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
        <Panel className="p-5">
          <Kicker>Shipping</Kicker>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            <li>{SHIPPING.prepaid}</li>
            <li>{SHIPPING.cod}</li>
            <li>Dispatch {SHIPPING.dispatch}</li>
            <li>Metros {SHIPPING.transitMetros}</li>
            <li>Tier-2/3 {SHIPPING.transitTier23}</li>
          </ul>
        </Panel>
        <Panel className="p-5">
          <Kicker>Returns</Kicker>
          <p className="mt-3 text-sm text-muted">
            {RETURNS.windowDays} days · {RETURNS.condition}
          </p>
        </Panel>
      </div>

      <Panel className="p-5">
        <Kicker>This instance vs production</Kicker>
        <p className="mt-2 text-sm leading-6 text-muted">
          Preview Auth is OFF (unowned DEMO rows). Production Admin already has HttpOnly cookies, CSRF, TOTP, RBAC. Do
          not copy session tokens here. Side effects that send mail or capture money stay in Brxinee/Smelloff and
          Brxinee/Admin.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="warn">Auth off</Badge>
          <Badge tone="acid">Database on</Badge>
          <Badge>IST</Badge>
          <Badge>paise</Badge>
        </div>
        <Link to="/activity" className="mt-4 inline-flex h-11 items-center text-sm text-info">
          Open activity / audit
        </Link>
      </Panel>
    </div>
  );
}
