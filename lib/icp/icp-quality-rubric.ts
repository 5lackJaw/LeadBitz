import { IcpDraft } from "./generate-icp-profile";

type ListFieldKey =
  | "targetIndustries"
  | "companySizeBands"
  | "buyerRoles"
  | "pains"
  | "exclusions"
  | "valuePropAngles";

type RubricListField = {
  label: string;
  maxPoints: number;
  minimumValues: number;
};

export const ICP_QUALITY_RUBRIC = {
  listFields: {
    targetIndustries: {
      label: "Target industries",
      maxPoints: 20,
      minimumValues: 2,
    },
    companySizeBands: {
      label: "Company size bands",
      maxPoints: 15,
      minimumValues: 2,
    },
    buyerRoles: {
      label: "Buyer roles",
      maxPoints: 20,
      minimumValues: 2,
    },
    pains: {
      label: "Pains",
      maxPoints: 15,
      minimumValues: 3,
    },
    exclusions: {
      label: "Exclusions",
      maxPoints: 10,
      minimumValues: 1,
    },
    valuePropAngles: {
      label: "Value prop angles",
      maxPoints: 15,
      minimumValues: 2,
    },
  } satisfies Record<ListFieldKey, RubricListField>,
  sourceSummary: {
    label: "Source summary",
    maxPoints: 5,
    minimumCharacters: 60,
  },
} as const;

export const ICP_QUALITY_TIER_THRESHOLDS = {
  highMinimumScore: 75,
  usableMinimumScore: 50,
} as const;

export type IcpQualityTier = "HIGH" | "USABLE" | "INSUFFICIENT";

export type IcpRubricBreakdownItem = {
  field: ListFieldKey | "sourceSummary";
  label: string;
  maxPoints: number;
  earnedPoints: number;
  minimumRequirement: number;
  actualValueCount: number;
  isMissing: boolean;
};

export type IcpRubricMissingField = {
  field: ListFieldKey | "sourceSummary";
  label: string;
  minimumRequirement: number;
  actualValueCount: number;
};

export type IcpRubricScore = {
  score: number;
  tier: IcpQualityTier;
  breakdown: IcpRubricBreakdownItem[];
  missingFields: IcpRubricMissingField[];
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeList(values: string[]): string[] {
  return values.map((value) => value.trim()).filter((value) => value.length > 0);
}

function scoreListField(field: ListFieldKey, values: string[]): IcpRubricBreakdownItem {
  const config = ICP_QUALITY_RUBRIC.listFields[field];
  const normalizedValues = normalizeList(values);
  const actualValueCount = normalizedValues.length;
  const completionRatio = clamp(actualValueCount / config.minimumValues, 0, 1);
  const earnedPoints = Math.round(config.maxPoints * completionRatio);
  const isMissing = actualValueCount < config.minimumValues;

  return {
    field,
    label: config.label,
    maxPoints: config.maxPoints,
    earnedPoints,
    minimumRequirement: config.minimumValues,
    actualValueCount,
    isMissing,
  };
}

function scoreSourceSummary(summary: string): IcpRubricBreakdownItem {
  const config = ICP_QUALITY_RUBRIC.sourceSummary;
  const normalizedSummary = summary.trim();
  const actualValueCount = normalizedSummary.length;
  const completionRatio = clamp(actualValueCount / config.minimumCharacters, 0, 1);
  const earnedPoints = Math.round(config.maxPoints * completionRatio);
  const isMissing = actualValueCount < config.minimumCharacters;

  return {
    field: "sourceSummary",
    label: config.label,
    maxPoints: config.maxPoints,
    earnedPoints,
    minimumRequirement: config.minimumCharacters,
    actualValueCount,
    isMissing,
  };
}

export function mapIcpQualityTier(score: number): IcpQualityTier {
  if (score >= ICP_QUALITY_TIER_THRESHOLDS.highMinimumScore) {
    return "HIGH";
  }

  if (score >= ICP_QUALITY_TIER_THRESHOLDS.usableMinimumScore) {
    return "USABLE";
  }

  return "INSUFFICIENT";
}

export function scoreIcpDraftWithRubric(icp: IcpDraft): IcpRubricScore {
  const listFieldOrder: ListFieldKey[] = [
    "targetIndustries",
    "companySizeBands",
    "buyerRoles",
    "pains",
    "exclusions",
    "valuePropAngles",
  ];

  const breakdown = listFieldOrder.map((field) => scoreListField(field, icp[field]));
  breakdown.push(scoreSourceSummary(icp.sourceSummary));

  const score = clamp(
    breakdown.reduce((sum, item) => sum + item.earnedPoints, 0),
    0,
    100,
  );
  const missingFields = breakdown
    .filter((item) => item.isMissing)
    .map((item) => ({
      field: item.field,
      label: item.label,
      minimumRequirement: item.minimumRequirement,
      actualValueCount: item.actualValueCount,
    }));

  return {
    score,
    tier: mapIcpQualityTier(score),
    breakdown,
    missingFields,
  };
}
