import { useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Btn, confidenceTone, severityTone } from "@/components/mc/ui";
import { mutateAction, verifyAllPending, type ActionRow } from "@/lib/mc/queries";
import { ageLabel, formatPaise } from "@/lib/utils";

export function ActionCard({ action }: { action: ActionRow }) {
  const router = useRouter();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  async function run(kind: "handled" | "snooze" | "primary") {
    setBusy(kind);
    try {
      if (kind === "primary" && action.action_key === "pendingUpi") {
        const res = await verifyAllPending();
        toast.success(
          `DEMO ledger: verified ${res.count} UPI · ${formatPaise(res.releasedPaise)}. Production verify is Admin UTR / Razorpay webhook.`,
        );
        await router.invalidate();
        return;
      }
      if (kind === "primary") {
        if (action.href) void navigate({ to: action.href as never });
        return;
      }
      await mutateAction({ data: { id: action.id, mutation: kind } });
      toast.success(kind === "handled" ? "Marked handled" : "Snoozed");
      await router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="rounded-md border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={severityTone(action.severity)}>{action.severity}</Badge>
        <Badge tone={confidenceTone(action.confidence)}>{action.confidence}</Badge>
        <Badge>{action.kind}</Badge>
        <span className="ml-auto font-mono text-[11px] text-faint">
          score {action.score.toFixed(1)} · {ageLabel(action.age_minutes)}
        </span>
      </div>
      <h3 className="mt-3 text-[15px] font-semibold tracking-tight">{action.title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted">{action.recommended}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {action.financial_impact_paise != null ? (
          <span className="font-mono text-sm tabular text-fg">{formatPaise(action.financial_impact_paise)}</span>
        ) : (
          <span className="font-mono text-xs text-faint">No ₹ attached</span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Btn variant="primary" disabled={busy !== null} onClick={() => void run("primary")}>
          {action.available_action ?? "Open"}
        </Btn>
        <Btn disabled={busy !== null} onClick={() => void run("handled")}>
          Handle
        </Btn>
        <Btn disabled={busy !== null} onClick={() => void run("snooze")}>
          Snooze
        </Btn>
      </div>
    </article>
  );
}
