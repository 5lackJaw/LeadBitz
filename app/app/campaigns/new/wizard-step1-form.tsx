"use client";

import { FormEvent, useMemo, useState } from "react";

import { validateWizardStep1Input, WizardStep1ValidationError } from "@/lib/campaigns/wizard-step1";

type WizardValidationResponse = {
  sourceType?: "WEBSITE_URL" | "PRODUCT_DESCRIPTION";
  websiteUrl?: string | null;
  productDescription?: string | null;
  nextStep?: string;
  error?: string;
};

export function WizardStep1Form() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const websiteEnabled = !productDescription.trim();
  const productDescriptionEnabled = !websiteUrl.trim();

  const activeInputMode = useMemo(() => {
    if (websiteUrl.trim()) {
      return "Website URL";
    }

    if (productDescription.trim()) {
      return "Product description";
    }

    return "None selected";
  }, [productDescription, websiteUrl]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      validateWizardStep1Input({ websiteUrl, productDescription });

      const response = await fetch("/api/campaigns/wizard/step1", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          websiteUrl,
          productDescription,
        }),
      });

      const data = (await response.json()) as WizardValidationResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Step 1 validation failed.");
      }

      setStatusMessage(
        `Step 1 validated using ${data.sourceType === "WEBSITE_URL" ? "website URL" : "product description"}. Step 2 (ICP generation) is next.`,
      );
    } catch (error) {
      if (error instanceof WizardStep1ValidationError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(error instanceof Error ? error.message : "Step 1 validation failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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
      </div>

      <form onSubmit={onSubmit} className="lb-form-grid" style={{ marginTop: "16px" }} noValidate>
        <label className="lb-field">
          <span className="lb-label">Website URL</span>
          <input
            className="lb-input"
            type="url"
            inputMode="url"
            placeholder="https://www.example.com"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
            disabled={!websiteEnabled || isSubmitting}
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
            onChange={(event) => setProductDescription(event.target.value)}
            disabled={!productDescriptionEnabled || isSubmitting}
            aria-describedby="wizard-step1-description-help"
          />
          <span id="wizard-step1-description-help" className="lb-subtitle">
            Use this option when the website is incomplete or unavailable.
          </span>
        </label>

        <button className="lb-button lb-button-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Validating..." : "Continue to Step 2"}
        </button>
      </form>

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
