import assert from "node:assert/strict";
import test from "node:test";

import {
  ICP_QUALITY_RUBRIC,
  ICP_QUALITY_TIER_THRESHOLDS,
  mapIcpQualityTier,
  scoreIcpDraftWithRubric,
} from "../../lib/icp/icp-quality-rubric";

test("scoreIcpDraftWithRubric returns 100 and HIGH for a complete ICP", () => {
  const result = scoreIcpDraftWithRubric({
    targetIndustries: ["B2B SaaS", "Agencies"],
    companySizeBands: ["11-50", "51-200"],
    buyerRoles: ["Founder", "Head of Sales"],
    pains: ["Low replies", "Deliverability risk", "Manual workflows"],
    exclusions: ["B2C only businesses"],
    valuePropAngles: ["Deliverability-first controls", "Operator-reviewed AI"],
    sourceSummary:
      "LeadBitz helps revenue teams execute controlled outbound with safer sending limits and clear campaign operations.",
  });

  assert.equal(result.score, 100);
  assert.equal(result.tier, "HIGH");
  assert.equal(result.missingFields.length, 0);
});

test("scoreIcpDraftWithRubric returns deterministic partial score and USABLE tier", () => {
  const result = scoreIcpDraftWithRubric({
    targetIndustries: ["B2B SaaS"],
    companySizeBands: ["11-50"],
    buyerRoles: ["Founder"],
    pains: ["Low replies", "Weak targeting"],
    exclusions: ["B2C only businesses"],
    valuePropAngles: ["Deliverability-first controls"],
    sourceSummary: "a".repeat(36),
  });

  assert.equal(result.score, 59);
  assert.equal(result.tier, "USABLE");
  assert.deepEqual(
    result.missingFields.map((field) => field.field),
    [
      "targetIndustries",
      "companySizeBands",
      "buyerRoles",
      "pains",
      "valuePropAngles",
      "sourceSummary",
    ],
  );
});

test("scoreIcpDraftWithRubric returns INSUFFICIENT for sparse payloads", () => {
  const result = scoreIcpDraftWithRubric({
    targetIndustries: [],
    companySizeBands: [],
    buyerRoles: ["Founder"],
    pains: [],
    exclusions: [],
    valuePropAngles: [],
    sourceSummary: "Short summary",
  });

  assert.equal(result.score, 11);
  assert.equal(result.tier, "INSUFFICIENT");
  assert.ok(result.missingFields.length > 0);
});

test("mapIcpQualityTier follows threshold constants", () => {
  assert.equal(mapIcpQualityTier(ICP_QUALITY_TIER_THRESHOLDS.highMinimumScore), "HIGH");
  assert.equal(mapIcpQualityTier(ICP_QUALITY_TIER_THRESHOLDS.highMinimumScore - 1), "USABLE");
  assert.equal(mapIcpQualityTier(ICP_QUALITY_TIER_THRESHOLDS.usableMinimumScore), "USABLE");
  assert.equal(mapIcpQualityTier(ICP_QUALITY_TIER_THRESHOLDS.usableMinimumScore - 1), "INSUFFICIENT");
});

test("rubric constants resolve to a 100-point scale", () => {
  const listFieldTotal = Object.values(ICP_QUALITY_RUBRIC.listFields).reduce(
    (sum, field) => sum + field.maxPoints,
    0,
  );
  const total = listFieldTotal + ICP_QUALITY_RUBRIC.sourceSummary.maxPoints;

  assert.equal(total, 100);
});
