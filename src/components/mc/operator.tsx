import { Link } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import { askOperator, type CopilotAnswer } from "@/lib/mc/queries";
import { Badge, Btn, confidenceTone, Kicker } from "@/components/mc/ui";

const PROMPTS = [
  "What needs my attention?",
  "Why did revenue move today?",
  "Is email reliable?",
  "Should I produce more stock?",
  "What's my contribution?",
];

export function Operator({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<CopilotAnswer[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    setQ("");
    try {
      const ans = await askOperator({ data: { question: text } });
      setHistory((h) => [ans, ...h].slice(0, 8));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operator unavailable");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="flex-1 bg-bg/60" aria-label="Close operator" onClick={() => onOpenChange(false)} />
      <aside className="flex h-full w-full max-w-md flex-col border-l border-line bg-bg-1">
        <header className="flex h-14 items-center gap-2 border-b border-line px-4">
          <Sparkles className="size-4 text-acid" />
          <div className="min-w-0">
            <div className="text-sm font-semibold">Operator</div>
            <Kicker>Evidence only · no invented numbers</Kicker>
          </div>
          <button
            type="button"
            className="ml-auto grid size-10 place-items-center rounded-sm text-muted"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3">
          {PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => void ask(p)}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted hover:text-fg"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mc-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {history.length === 0 && !busy ? (
            <p className="text-sm text-muted">
              Ask from facts in this ledger. If a number is missing, the answer is DATA UNAVAILABLE.
            </p>
          ) : null}
          {busy ? <p className="text-sm text-muted">Reading the ledger…</p> : null}
          {history.map((h, i) => (
            <article key={`${h.question}-${i}`} className="rounded-md border border-line bg-surface p-3">
              <p className="text-xs text-muted">{h.question}</p>
              <p className="mt-2 text-sm leading-6 text-fg">{h.answer}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={confidenceTone(h.confidence)}>{h.confidence}</Badge>
                {h.usedModel ? <Badge>polished</Badge> : <Badge>deterministic</Badge>}
              </div>
              {h.evidence.length ? (
                <ul className="mt-2 space-y-1">
                  {h.evidence.map((e) => (
                    <li key={e} className="font-mono text-[11px] text-faint">
                      {e}
                    </li>
                  ))}
                </ul>
              ) : null}
              {h.recommended ? <p className="mt-2 text-sm text-acid">{h.recommended}</p> : null}
              {h.href ? (
                <Link
                  to={h.href as never}
                  onClick={() => onOpenChange(false)}
                  className="mt-2 inline-flex h-10 items-center text-sm text-info"
                >
                  Open related view
                </Link>
              ) : null}
            </article>
          ))}
        </div>
        <form
          className="flex gap-2 border-t border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(q);
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask from facts…"
            className="h-10 flex-1 rounded-sm border border-line bg-surface px-3 text-sm text-fg placeholder:text-faint"
          />
          <Btn type="submit" variant="primary" disabled={busy || !q.trim()}>
            Ask
          </Btn>
        </form>
      </aside>
    </div>
  );
}
