const MAX_WEBSITE_URL_LENGTH = 2048;
const MAX_PRODUCT_DESCRIPTION_LENGTH = 10000;

export class WizardStep1ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WizardStep1ValidationError";
  }
}

export type WizardStep1ValidatedInput = {
  sourceType: "WEBSITE_URL" | "PRODUCT_DESCRIPTION";
  websiteUrl: string | null;
  productDescription: string | null;
};

function normalizeText(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  return input.trim();
}

function normalizeWebsiteUrl(input: string): string {
  try {
    const parsed = new URL(input);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new WizardStep1ValidationError("Website URL must start with http:// or https://.");
    }

    return parsed.toString();
  } catch (error) {
    if (error instanceof WizardStep1ValidationError) {
      throw error;
    }

    throw new WizardStep1ValidationError("Website URL is not a valid URL.");
  }
}

export function validateWizardStep1Input(input: {
  websiteUrl?: unknown;
  productDescription?: unknown;
}): WizardStep1ValidatedInput {
  const websiteUrlRaw = normalizeText(input.websiteUrl);
  const productDescriptionRaw = normalizeText(input.productDescription);

  const hasWebsiteUrl = Boolean(websiteUrlRaw);
  const hasProductDescription = Boolean(productDescriptionRaw);

  if (hasWebsiteUrl && hasProductDescription) {
    throw new WizardStep1ValidationError(
      "Provide either a website URL or a product description, not both.",
    );
  }

  if (!hasWebsiteUrl && !hasProductDescription) {
    throw new WizardStep1ValidationError(
      "Provide either a website URL or a product description to continue.",
    );
  }

  if (hasWebsiteUrl) {
    if (websiteUrlRaw.length > MAX_WEBSITE_URL_LENGTH) {
      throw new WizardStep1ValidationError("Website URL is too long.");
    }

    const normalizedUrl = normalizeWebsiteUrl(websiteUrlRaw);

    return {
      sourceType: "WEBSITE_URL",
      websiteUrl: normalizedUrl,
      productDescription: null,
    };
  }

  if (productDescriptionRaw.length > MAX_PRODUCT_DESCRIPTION_LENGTH) {
    throw new WizardStep1ValidationError("Product description is too long.");
  }

  return {
    sourceType: "PRODUCT_DESCRIPTION",
    websiteUrl: null,
    productDescription: productDescriptionRaw,
  };
}
