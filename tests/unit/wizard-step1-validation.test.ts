import assert from "node:assert/strict";
import test from "node:test";

import { validateWizardStep1Input, WizardStep1ValidationError } from "../../lib/campaigns/wizard-step1";

test("validateWizardStep1Input accepts website URL and normalizes it", () => {
  const validated = validateWizardStep1Input({
    websiteUrl: "https://leadbitz.com/pricing",
    productDescription: "",
  });

  assert.equal(validated.sourceType, "WEBSITE_URL");
  assert.equal(validated.websiteUrl, "https://leadbitz.com/pricing");
  assert.equal(validated.productDescription, null);
});

test("validateWizardStep1Input accepts product description path", () => {
  const validated = validateWizardStep1Input({
    websiteUrl: "",
    productDescription: "LeadBitz helps teams run deliverability-safe outbound campaigns.",
  });

  assert.equal(validated.sourceType, "PRODUCT_DESCRIPTION");
  assert.equal(validated.websiteUrl, null);
  assert.equal(
    validated.productDescription,
    "LeadBitz helps teams run deliverability-safe outbound campaigns.",
  );
});

test("validateWizardStep1Input rejects both URL and text provided", () => {
  assert.throws(
    () =>
      validateWizardStep1Input({
        websiteUrl: "https://leadbitz.com",
        productDescription: "Both values are present.",
      }),
    (error: unknown) => {
      assert.ok(error instanceof WizardStep1ValidationError);
      assert.match(error.message, /either a website URL or a product description/i);
      return true;
    },
  );
});

test("validateWizardStep1Input rejects missing input", () => {
  assert.throws(
    () =>
      validateWizardStep1Input({
        websiteUrl: "",
        productDescription: "",
      }),
    (error: unknown) => {
      assert.ok(error instanceof WizardStep1ValidationError);
      assert.match(error.message, /provide either/i);
      return true;
    },
  );
});

test("validateWizardStep1Input rejects non-http protocols", () => {
  assert.throws(
    () =>
      validateWizardStep1Input({
        websiteUrl: "ftp://example.com",
        productDescription: "",
      }),
    (error: unknown) => {
      assert.ok(error instanceof WizardStep1ValidationError);
      assert.match(error.message, /http:\/\/ or https:\/\//i);
      return true;
    },
  );
});
