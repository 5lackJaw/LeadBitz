"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { validateWizardStep1Input, WizardStep1ValidationError } from "@/lib/campaigns/wizard-step1";

type IcpDraftPayload = {
  targetIndustries: string[];
  companySizeBands: string[];
  buyerRoles: string[];
  pains: string[];
  exclusions: string[];
  valuePropAngles: string[];
  sourceSummary: string;
};

type IcpGenerationResponse = {
  icpProfileId?: string;
  icpVersionId?: string | null;
  profileName?: string;
  icp?: IcpDraftPayload;
  sourceType?: "WEBSITE_URL" | "PRODUCT_DESCRIPTION";
  sourceValue?: string;
  campaignId?: string | null;
  error?: string;
};

type IcpUpdateResponse = {
  icpProfileId?: string;
  profileName?: string;
  icp?: IcpDraftPayload;
  updatedAt?: string;
  error?: string;
};

type IcpEditorState = {
  targetIndustries: string;
  companySizeBands: string;
  buyerRoles: string;
  pains: string;
  exclusions: string;
  valuePropAngles: string;
  sourceSummary: string;
};

type WizardInitialState = {
  websiteUrl?: string;
  productDescription?: string;
  profileName?: string;
  icpVersionId?: string | null;
  generatedIcpProfileId?: string | null;
  icpEditorState?: IcpEditorState | null;
};

type WizardStep1FormProps = {
  campaignId?: string | null;
  initialState?: WizardInitialState;
};

type IcpQualityTier = "HIGH" | "USABLE" | "INSUFFICIENT";

type IcpScoreResponse = {
  icpQualityScoreId?: string;
  score?: number;
  tier?: IcpQualityTier;
  missingFields?: Array<{
    field: string;
    label: string;
    minimumRequirement: number;
    actualValueCount: number;
  }>;
  explanations?: string[];
  questions?: string[];
  computedAt?: string;
  error?: string;
};

function listToTextarea(values: string[]): string {
  return values.join("\n");
}

function textareaToList(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function WizardStep1Form({ campaignId, initialState }: WizardStep1FormProps) {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState(initialState?.websiteUrl ?? "");
  const [productDescription, setProductDescription] = useState(initialState?.productDescription ?? "");
  const [profileName, setProfileName] = useState(initialState?.profileName ?? "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingIcp, setIsSavingIcp] = useState(false);
  const [generatedIcpProfileId, setGeneratedIcpProfileId] = useState<string | null>(
    initialState?.generatedIcpProfileId ?? null,
  );
  const [icpVersionId, setIcpVersionId] = useState<string | null>(initialState?.icpVersionId ?? null);
  const [icpEditorState, setIcpEditorState] = useState<IcpEditorState | null>(
    initialState?.icpEditorState ?? null,
  );
  const [isScoringIcp, setIsScoringIcp] = useState(false);
  const [icpScore, setIcpScore] = useState<IcpScoreResponse | null>(null);
  const [lastSavedAtLabel, setLastSavedAtLabel] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeInputMode = useMemo(() => {
    if (websiteUrl.trim()) {
      return "Website URL";
    }

    if (productDescription.trim()) {
      return "Product description";
    }

    return "None selected";
  }, [productDescription, websiteUrl]);

  async function persistWizardState(nextState: {
    websiteUrl: string;
    productDescription: string;
    profileName: string;
    icpVersionId: string | null;
    generatedIcpProfileId: string | null;
    icpEditorState: IcpEditorState | null;
  }) {
    if (!campaignId) {
      return;
    }

    const response = await fetch(`/api/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        wizardState: nextState,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to persist wizard state.");
    }

    // Keep App Router cache in sync so resume links reflect latest wizard data.
    router.refresh();
  }

  async function runIcpScore(input: { campaignId: string; icpVersionId: string }) {
    setIsScoringIcp(true);

    try {
      const response = await fetch("/api/icp/score", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const data = (await response.json()) as IcpScoreResponse;

      if (!response.ok || typeof data.score !== "number" || !data.tier) {
        throw new Error(data.error ?? "Failed to score ICP.");
      }

      setIcpScore(data);
      return data;
    } catch (error) {
      setIcpScore(null);
      setErrorMessage(error instanceof Error ? error.message : "Failed to score ICP.");
      return null;
    } finally {
      setIsScoringIcp(false);
    }
  }

  function onWebsiteUrlChange(nextValue: string) {
    setWebsiteUrl(nextValue);

    if (nextValue.trim().length > 0 && productDescription.trim().length > 0) {
      setProductDescription("");
    }
  }

  function onProductDescriptionChange(nextValue: string) {
    setProductDescription(nextValue);

    if (nextValue.trim().length > 0 && websiteUrl.trim().length > 0) {
      setWebsiteUrl("");
    }
  }

  async function onGenerateIcp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsGenerating(true);

    try {
      validateWizardStep1Input({ websiteUrl, productDescription });

      const response = await fetch("/api/icp/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          websiteUrl,
          productDescription,
          profileName,
          campaignId,
        }),
      });

      const data = (await response.json()) as IcpGenerationResponse;

      if (!response.ok || !data.icp || !data.icpProfileId) {
        throw new Error(data.error ?? "ICP generation failed.");
      }

      const resolvedProfileName = data.profileName ?? profileName.trim();
      const nextEditorState: IcpEditorState = {
        targetIndustries: listToTextarea(data.icp.targetIndustries),
        companySizeBands: listToTextarea(data.icp.companySizeBands),
        buyerRoles: listToTextarea(data.icp.buyerRoles),
        pains: listToTextarea(data.icp.pains),
        exclusions: listToTextarea(data.icp.exclusions),
        valuePropAngles: listToTextarea(data.icp.valuePropAngles),
        sourceSummary: data.icp.sourceSummary,
      };

      setGeneratedIcpProfileId(data.icpProfileId);
      setIcpVersionId(data.icpVersionId ?? null);
      setProfileName(resolvedProfileName);
      setIcpEditorState(nextEditorState);
      setIcpScore(null);
      setLastSavedAtLabel(null);

      await persistWizardState({
        websiteUrl,
        productDescription,
        profileName: resolvedProfileName,
        icpVersionId: data.icpVersionId ?? null,
        generatedIcpProfileId: data.icpProfileId,
        icpEditorState: nextEditorState,
      });

      if (campaignId && data.icpVersionId) {
        const score = await runIcpScore({
          campaignId,
          icpVersionId: data.icpVersionId,
        });

        if (score) {
          setStatusMessage(
            `Step 1 validated. Step 2 draft scored ${score.score}/100 (${score.tier}).`,
          );
        } else {
          setStatusMessage("Step 1 validated. Step 2 ICP draft is ready to edit.");
        }
      } else {
        setStatusMessage("Step 1 validated. Step 2 ICP draft is ready to edit.");
      }
    } catch (error) {
      if (error instanceof WizardStep1ValidationError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(error instanceof Error ? error.message : "ICP generation failed.");
      }
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSaveIcpEdits(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!generatedIcpProfileId || !icpEditorState) {
      setErrorMessage("Generate an ICP draft before saving edits.");
      return;
    }

    setIsSavingIcp(true);

    try {
      const response = await fetch(`/api/icp/profiles/${generatedIcpProfileId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          profileName,
          icp: {
            targetIndustries: textareaToList(icpEditorState.targetIndustries),
            companySizeBands: textareaToList(icpEditorState.companySizeBands),
            buyerRoles: textareaToList(icpEditorState.buyerRoles),
            pains: textareaToList(icpEditorState.pains),
            exclusions: textareaToList(icpEditorState.exclusions),
            valuePropAngles: textareaToList(icpEditorState.valuePropAngles),
            sourceSummary: icpEditorState.sourceSummary.trim(),
          },
        }),
      });

      const data = (await response.json()) as IcpUpdateResponse;

      if (!response.ok || !data.icp) {
        throw new Error(data.error ?? "Failed to persist ICP edits.");
      }

      const nextEditorState: IcpEditorState = {
        targetIndustries: listToTextarea(data.icp.targetIndustries),
        companySizeBands: listToTextarea(data.icp.companySizeBands),
        buyerRoles: listToTextarea(data.icp.buyerRoles),
        pains: listToTextarea(data.icp.pains),
        exclusions: listToTextarea(data.icp.exclusions),
        valuePropAngles: listToTextarea(data.icp.valuePropAngles),
        sourceSummary: data.icp.sourceSummary,
      };

      setIcpEditorState(nextEditorState);

      const nextProfileName = data.profileName ?? profileName;
      if (data.profileName) {
        setProfileName(data.profileName);
      }

      await persistWizardState({
        websiteUrl,
        productDescription,
        profileName: nextProfileName,
        icpVersionId,
        generatedIcpProfileId,
        icpEditorState: nextEditorState,
      });

      const savedAtLabel = data.updatedAt ? new Date(data.updatedAt).toLocaleString() : null;
      setLastSavedAtLabel(savedAtLabel);

      if (campaignId && icpVersionId) {
        const score = await runIcpScore({
          campaignId,
          icpVersionId,
        });
        if (score) {
          setStatusMessage(
            savedAtLabel
              ? `ICP edits saved at ${savedAtLabel}. Current quality score: ${score.score}/100 (${score.tier}).`
              : `ICP edits saved. Current quality score: ${score.score}/100 (${score.tier}).`,
          );
        } else {
          setStatusMessage(savedAtLabel ? `ICP edits saved at ${savedAtLabel}.` : "ICP edits saved.");
        }
      } else {
        setStatusMessage(savedAtLabel ? `ICP edits saved at ${savedAtLabel}.` : "ICP edits saved.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to persist ICP edits.");
    } finally {
      setIsSavingIcp(false);
    }
  }

  const shouldWarnOnContinue = icpScore?.tier === "INSUFFICIENT" || icpScore?.tier === "USABLE";
  const continueHref = campaignId ? `/app/campaigns/${campaignId}/discovery` : null;

  return (
    <section className="lb-panel">
      <div style={{ display: "grid", gap: "12px" }}>
        <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
          Step 1: Campaign Input
        </h2>
        <p className="lb-subtitle">
          Provide exactly one input source. You can use a website URL or a pasted product description.
        </p>
        <p className="lb-subtitle">Current mode: {activeInputMode}</p>
        {campaignId ? <p className="lb-subtitle">Campaign-linked wizard state is enabled.</p> : null}
      </div>

      <form onSubmit={onGenerateIcp} className="lb-form-grid" style={{ marginTop: "16px" }} noValidate>
        <label className="lb-field">
          <span className="lb-label">Website URL</span>
          <input
            className="lb-input"
            type="url"
            inputMode="url"
            placeholder="https://www.example.com"
            value={websiteUrl}
            onChange={(event) => onWebsiteUrlChange(event.target.value)}
            disabled={isGenerating || isSavingIcp}
            aria-describedby="wizard-step1-url-help"
          />
          <span id="wizard-step1-url-help" className="lb-subtitle">
            Use this option when the website best describes the product.
          </span>
        </label>

        <label className="lb-field">
          <span className="lb-label">Product Description</span>
          <textarea
            className="lb-input"
            style={{ minHeight: "160px", resize: "vertical" }}
            placeholder="Paste a concise product description..."
            value={productDescription}
            onChange={(event) => onProductDescriptionChange(event.target.value)}
            disabled={isGenerating || isSavingIcp}
            aria-describedby="wizard-step1-description-help"
          />
          <span id="wizard-step1-description-help" className="lb-subtitle">
            Use this option when the website is incomplete or unavailable.
          </span>
        </label>

        <label className="lb-field">
          <span className="lb-label">ICP profile name (optional)</span>
          <input
            className="lb-input"
            type="text"
            value={profileName}
            onChange={(event) => setProfileName(event.target.value)}
            placeholder="Website ICP Draft"
            maxLength={120}
            disabled={isGenerating || isSavingIcp}
          />
        </label>

        <button className="lb-button lb-button-primary" type="submit" disabled={isGenerating || isSavingIcp}>
          {isGenerating ? "Generating..." : generatedIcpProfileId ? "Regenerate ICP draft" : "Generate ICP draft"}
        </button>

        <p className="lb-subtitle">Typing into one source field will clear the other to keep Step 1 valid.</p>
      </form>

      {generatedIcpProfileId && icpEditorState ? (
        <section className="lb-panel" style={{ marginTop: "24px", padding: "16px" }}>
          <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
            <h3 className="lb-title" style={{ fontSize: "18px", lineHeight: "28px" }}>
              Step 2: ICP Editor
            </h3>
            <p className="lb-subtitle">
              Edit generated ICP fields, then save to persist changes in your workspace.
            </p>
            {lastSavedAtLabel ? <p className="lb-subtitle">Last saved: {lastSavedAtLabel}</p> : null}
            {campaignId && icpVersionId ? (
              <p className="lb-subtitle">Quality scoring enabled for this campaign-linked ICP version.</p>
            ) : (
              <p className="lb-subtitle">
                Quality scoring becomes available when this wizard is opened with a campaign id.
              </p>
            )}
            <code style={{ fontFamily: "var(--font-ui-mono)", color: "var(--ui-fg-muted)" }}>
              Profile id: {generatedIcpProfileId}
            </code>
            {icpVersionId ? (
              <code style={{ fontFamily: "var(--font-ui-mono)", color: "var(--ui-fg-muted)" }}>
                Version id: {icpVersionId}
              </code>
            ) : null}
          </div>

          <form onSubmit={onSaveIcpEdits} className="lb-form-grid">
            <label className="lb-field">
              <span className="lb-label">Target industries (one per line)</span>
              <textarea
                className="lb-input"
                style={{ minHeight: "120px", resize: "vertical" }}
                value={icpEditorState.targetIndustries}
                onChange={(event) =>
                  setIcpEditorState((current) =>
                    current ? { ...current, targetIndustries: event.target.value } : current,
                  )
                }
                disabled={isSavingIcp || isGenerating}
              />
            </label>

            <label className="lb-field">
              <span className="lb-label">Company size bands (one per line)</span>
              <textarea
                className="lb-input"
                style={{ minHeight: "100px", resize: "vertical" }}
                value={icpEditorState.companySizeBands}
                onChange={(event) =>
                  setIcpEditorState((current) =>
                    current ? { ...current, companySizeBands: event.target.value } : current,
                  )
                }
                disabled={isSavingIcp || isGenerating}
              />
            </label>

            <label className="lb-field">
              <span className="lb-label">Buyer roles (one per line)</span>
              <textarea
                className="lb-input"
                style={{ minHeight: "100px", resize: "vertical" }}
                value={icpEditorState.buyerRoles}
                onChange={(event) =>
                  setIcpEditorState((current) =>
                    current ? { ...current, buyerRoles: event.target.value } : current,
                  )
                }
                disabled={isSavingIcp || isGenerating}
              />
            </label>

            <label className="lb-field">
              <span className="lb-label">Pains (one per line)</span>
              <textarea
                className="lb-input"
                style={{ minHeight: "120px", resize: "vertical" }}
                value={icpEditorState.pains}
                onChange={(event) =>
                  setIcpEditorState((current) => (current ? { ...current, pains: event.target.value } : current))
                }
                disabled={isSavingIcp || isGenerating}
              />
            </label>

            <label className="lb-field">
              <span className="lb-label">Exclusions (one per line)</span>
              <textarea
                className="lb-input"
                style={{ minHeight: "100px", resize: "vertical" }}
                value={icpEditorState.exclusions}
                onChange={(event) =>
                  setIcpEditorState((current) =>
                    current ? { ...current, exclusions: event.target.value } : current,
                  )
                }
                disabled={isSavingIcp || isGenerating}
              />
            </label>

            <label className="lb-field">
              <span className="lb-label">Value prop angles (one per line)</span>
              <textarea
                className="lb-input"
                style={{ minHeight: "120px", resize: "vertical" }}
                value={icpEditorState.valuePropAngles}
                onChange={(event) =>
                  setIcpEditorState((current) =>
                    current ? { ...current, valuePropAngles: event.target.value } : current,
                  )
                }
                disabled={isSavingIcp || isGenerating}
              />
            </label>

            <label className="lb-field">
              <span className="lb-label">Source summary</span>
              <textarea
                className="lb-input"
                style={{ minHeight: "100px", resize: "vertical" }}
                value={icpEditorState.sourceSummary}
                onChange={(event) =>
                  setIcpEditorState((current) =>
                    current ? { ...current, sourceSummary: event.target.value } : current,
                  )
                }
                disabled={isSavingIcp || isGenerating}
              />
            </label>

            <button className="lb-button lb-button-primary" type="submit" disabled={isSavingIcp || isGenerating}>
              {isSavingIcp ? "Saving..." : "Save ICP edits"}
            </button>
          </form>

          <section className="lb-panel" style={{ marginTop: "16px", padding: "16px" }}>
            <div style={{ display: "grid", gap: "8px" }}>
              <h4 className="lb-title" style={{ fontSize: "16px", lineHeight: "24px" }}>
                ICP Quality Panel
              </h4>
              <p className="lb-subtitle">
                Score, tier, and missing-field guidance for this ICP version.
              </p>
            </div>

            <div style={{ marginTop: "12px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="lb-button lb-button-secondary"
                disabled={!campaignId || !icpVersionId || isScoringIcp || isSavingIcp || isGenerating}
                onClick={async () => {
                  setErrorMessage(null);
                  setStatusMessage(null);

                  if (!campaignId || !icpVersionId) {
                    setErrorMessage("Campaign-linked ICP version is required for scoring.");
                    return;
                  }

                  const score = await runIcpScore({ campaignId, icpVersionId });
                  if (score) {
                    setStatusMessage(`ICP scored ${score.score}/100 (${score.tier}).`);
                  }
                }}
              >
                {isScoringIcp ? "Scoring..." : "Re-score ICP"}
              </button>

              {campaignId ? (
                <Link href={`/app/campaigns/${campaignId}/icp/improve`} className="lb-button lb-button-secondary">
                  Improve ICP
                </Link>
              ) : (
                <button type="button" className="lb-button lb-button-secondary" disabled>
                  Improve ICP
                </button>
              )}

              {continueHref ? (
                <Link href={continueHref} className="lb-button lb-button-primary">
                  {shouldWarnOnContinue ? "Continue anyway to Step 3" : "Continue to Step 3"}
                </Link>
              ) : (
                <button type="button" className="lb-button lb-button-primary" disabled>
                  Continue to Step 3
                </button>
              )}
            </div>

            {icpScore ? (
              <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
                <p className="lb-subtitle">
                  Score: <strong>{icpScore.score ?? "-"}/100</strong> | Tier:{" "}
                  <strong>{icpScore.tier ?? "UNKNOWN"}</strong>
                </p>

                {icpScore.missingFields && icpScore.missingFields.length > 0 ? (
                  <div className="lb-alert lb-alert-info" role="status">
                    Missing fields:
                    {" " + icpScore.missingFields.map((item) => item.label).join(", ")}
                  </div>
                ) : (
                  <div className="lb-alert lb-alert-success" role="status">
                    No missing fields flagged by the current rubric.
                  </div>
                )}

                {icpScore.questions && icpScore.questions.length > 0 ? (
                  <ul className="lb-subtitle" style={{ margin: 0, paddingLeft: "20px" }}>
                    {icpScore.questions.map((question, index) => (
                      <li key={`${question}-${index}`}>{question}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <p className="lb-subtitle" style={{ marginTop: "12px" }}>
                Run scoring to view quality tier, missing fields, and improvement prompts.
              </p>
            )}

            {shouldWarnOnContinue ? (
              <p className="lb-alert lb-alert-info" role="status" style={{ marginTop: "12px" }}>
                This ICP is below high-quality threshold. Continue is allowed, but improve before launch is
                recommended.
              </p>
            ) : null}
          </section>
        </section>
      ) : null}

      {statusMessage ? (
        <p className="lb-alert lb-alert-success" role="status" style={{ marginTop: "12px" }}>
          {statusMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="lb-alert lb-alert-danger" role="alert" style={{ marginTop: "12px" }}>
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
