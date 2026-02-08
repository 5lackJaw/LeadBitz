import { CandidateVerificationStatus } from "@prisma/client";

const DEFAULT_BASE_URL = "https://api.neverbounce.com/v4";
const DEFAULT_MAX_RETRIES = 2;
const TRANSIENT_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

export class EmailVerificationClientValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailVerificationClientValidationError";
  }
}

export class EmailVerificationClientRequestError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "EmailVerificationClientRequestError";
    this.status = status;
    this.body = body;
  }
}

export type EmailVerificationResult = {
  email: string;
  status: CandidateVerificationStatus;
  checkedAt: Date;
  details?: Record<string, unknown> | null;
};

type VerificationApiResponse = {
  status: number;
  json(): Promise<unknown>;
};

type VerificationFetch = (
  input: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
  },
) => Promise<VerificationApiResponse>;

type SleepFn = (ms: number) => Promise<void>;

type EmailVerificationClientOptions = {
  providerKey: string;
  apiKey: string;
  baseUrl?: string;
  maxRetries?: number;
  fetchImpl?: VerificationFetch;
  sleep?: SleepFn;
};

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeStatus(value: unknown): CandidateVerificationStatus {
  if (typeof value !== "string") {
    return CandidateVerificationStatus.UNKNOWN;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "valid" || normalized === "verified") {
    return CandidateVerificationStatus.VERIFIED;
  }

  if (normalized === "invalid") {
    return CandidateVerificationStatus.INVALID;
  }

  if (normalized === "risky" || normalized === "accept_all" || normalized === "catch_all") {
    return CandidateVerificationStatus.RISKY;
  }

  return CandidateVerificationStatus.UNKNOWN;
}

export class EmailVerificationClient {
  readonly providerKey: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly fetchImpl: VerificationFetch;
  private readonly sleep: SleepFn;

  constructor(options: EmailVerificationClientOptions) {
    const providerKey = options.providerKey.trim().toLowerCase();
    if (!providerKey) {
      throw new EmailVerificationClientValidationError("providerKey is required.");
    }

    const apiKey = options.apiKey.trim();
    if (!apiKey) {
      throw new EmailVerificationClientValidationError("apiKey is required.");
    }

    const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    if (!Number.isInteger(maxRetries) || maxRetries < 0 || maxRetries > 10) {
      throw new EmailVerificationClientValidationError("maxRetries must be an integer between 0 and 10.");
    }

    this.providerKey = providerKey;
    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.maxRetries = maxRetries;
    this.fetchImpl = options.fetchImpl ?? (fetch as unknown as VerificationFetch);
    this.sleep = options.sleep ?? defaultSleep;
  }

  async verifyBatch(emails: string[]): Promise<EmailVerificationResult[]> {
    const uniqueEmails = Array.from(
      new Set(
        emails
          .map((email) => email.trim().toLowerCase())
          .filter((email) => email.length > 0),
      ),
    );

    if (uniqueEmails.length === 0) {
      return [];
    }

    const payload = {
      emails: uniqueEmails,
    };

    let attempt = 0;
    while (attempt <= this.maxRetries) {
      try {
        const response = await this.fetchImpl(`${this.baseUrl}/email/verify/bulk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        const body = await response.json();

        if (!TRANSIENT_STATUS_CODES.has(response.status) && response.status >= 400) {
          throw new EmailVerificationClientRequestError("Email verification request failed.", response.status, body);
        }

        if (TRANSIENT_STATUS_CODES.has(response.status)) {
          throw new EmailVerificationClientRequestError("Email verification transient error.", response.status, body);
        }

        const rows = Array.isArray((body as { results?: unknown }).results)
          ? ((body as { results: Array<Record<string, unknown>> }).results ?? [])
          : [];

        const checkedAt = new Date();

        const parsedRows = rows
          .map((row): EmailVerificationResult | null => {
            const email = typeof row.email === "string" ? row.email.trim().toLowerCase() : "";
            if (!email) {
              return null;
            }

            return {
              email,
              status: normalizeStatus(row.status),
              checkedAt,
              details: row,
            };
          });

        return parsedRows.filter((row): row is EmailVerificationResult => row !== null);
      } catch (error) {
        const canRetry =
          error instanceof EmailVerificationClientRequestError &&
          TRANSIENT_STATUS_CODES.has(error.status) &&
          attempt < this.maxRetries;

        if (!canRetry) {
          throw error;
        }

        const delayMs = Math.min(250 * 2 ** attempt, 3000);
        await this.sleep(delayMs);
        attempt += 1;
      }
    }

    return [];
  }
}
