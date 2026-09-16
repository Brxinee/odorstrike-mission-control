import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { financialImpactFactor, scoreAction } from "./actions.ts";

describe("action priority engine", () => {
  it("does not inflate score when money is missing", () => {
    const withMoney = scoreAction({
      severity: "critical",
      paise: 91600,
      urgency: "immediate",
      confidence: "PROVEN",
    });
    const noMoney = scoreAction({
      severity: "critical",
      paise: null,
      urgency: "immediate",
      confidence: "PROVEN",
    });
    assert.equal(financialImpactFactor(null), 1);
    assert.equal(financialImpactFactor(0), 1);
    assert.ok(withMoney.score > noMoney.score);
  });

  it("ages 24h+ to immediate urgency", () => {
    const fresh = scoreAction({
      severity: "warning",
      paise: 10000,
      urgency: "week",
      confidence: "PROVEN",
      ageHours: 1,
    });
    const stale = scoreAction({
      severity: "warning",
      paise: 10000,
      urgency: "week",
      confidence: "PROVEN",
      ageHours: 24,
    });
    assert.ok(stale.score > fresh.score);
  });

  it("INFERRED is weaker than PROVEN", () => {
    const proven = scoreAction({
      severity: "warning",
      paise: 22900,
      urgency: "today",
      confidence: "PROVEN",
    });
    const inferred = scoreAction({
      severity: "warning",
      paise: 22900,
      urgency: "today",
      confidence: "INFERRED",
    });
    assert.ok(inferred.score < proven.score);
  });
});
