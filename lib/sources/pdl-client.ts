const DEFAULT_BASE_URL = "https://api.peopledatalabs.com/v5";
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_MIN_REQUEST_INTERVAL_MS = 250;
const BASE_RETRY_DELAY_MS = 250;
const MAX_RETRY_DELAY_MS = 3000;
const TRANSIENT_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

export class PdlClientValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdlClientValidationError";
  }
}

export class PdlClientRequestError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "PdlClientRequestError";
    this.status = status;
    this.body = body;
  }
}

export type PdlSearchFilters = {
  industry?: string[];
  companySize?: string[];
  jobTitle?: string[];
  seniority?: string[];
  department?: string[];
  geoCountry?: string[];
  geoRegion?: string[];
  geoCity?: string[];
  requiredFields?: string[];
};

export type PdlCompany = {
  id: string | null;
  name: string | null;
  domain: string | null;
  website: string | null;
};

export type PdlCandidate = {
  personProviderId: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  email: string | null;
  title: string | null;
  seniority: string | null;
  department: string | null;
  company: PdlCompany;
  location: string | null;
};

export type PdlSearchPage = {
  items: PdlCandidate[];
  nextCursor: string | null;
};

type PdlFetchResponse = {
  status: number;
  json(): Promise<unknown>;
};

type PdlFetch = (
  input: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
  },
) => Promise<PdlFetchResponse>;

type SleepFn = (ms: number) => Promise<void>;
type NowFn = () => number;

type PdlClientOptions = {
  apiKey: string;
  baseUrl?: string;
  pageSize?: number;
  maxRetries?: number;
  minRequestIntervalMs?: number;
  fetchImpl?: PdlFetch;
  sleep?: SleepFn;
  now?: NowFn;
};

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const cleaned = value.filter((entry) => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : undefined;
}

function normalizeFilters(filters: PdlSearchFilters = {}): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  const mappings: Array<[keyof PdlSearchFilters, string]> = [
    ["industry", "industry"],
    ["companySize", "company_size"],
    ["jobTitle", "job_title"],
    ["seniority", "seniority"],
    ["department", "department"],
    ["geoCountry", "geo_country"],
    ["geoRegion", "geo_region"],
    ["geoCity", "geo_city"],
    ["requiredFields", "required_fields"],
  ];

  for (const [sourceKey, targetKey] of mappings) {
    const values = toStringArray(filters[sourceKey]);
    if (values) {
      normalized[targetKey] = values;
    }
  }

  return normalized;
}

function parseCandidate(raw: unknown): PdlCandidate {
  const record = isObject(raw) ? raw : {};
  const companyRecord = isObject(record.company) ? record.company : {};

  return {
    personProviderId: typeof record.id === "string" ? record.id : null,
    firstName: typeof record.first_name === "string" ? record.first_name : null,
    lastName: typeof record.last_name === "string" ? record.last_name : null,
    fullName: typeof record.full_name === "string" ? record.full_name : null,
    email: typeof record.work_email === "string" ? record.work_email : null,
    title: typeof record.job_title === "string" ? record.job_title : null,
    seniority: typeof record.job_seniority === "string" ? record.job_seniority : null,
    department: typeof record.job_department === "string" ? record.job_department : null,
    company: {
      id: typeof companyRecord.id === "string" ? companyRecord.id : null,
      name: typeof companyRecord.name === "string" ? companyRecord.name : null,
      domain: typeof companyRecord.domain === "string" ? companyRecord.domain : null,
      website: typeof companyRecord.website === "string" ? companyRecord.website : null,
    },
    location: typeof record.location_name === "string" ? record.location_name : null,
  };
}

function parseSearchResponse(payload: unknown): PdlSearchPage {
  const root = isObject(payload) ? payload : {};
  const rawItems = Array.isArray(root.data) ? root.data : [];
  const nextCursor = typeof root.next_cursor === "string" ? root.next_cursor : null;

  return {
    items: rawItems.map(parseCandidate),
    nextCursor,
  };
}

export class PdlClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly pageSize: number;
  private readonly maxRetries: number;
  private readonly minRequestIntervalMs: number;
  private readonly fetchImpl: PdlFetch;
  private readonly sleep: SleepFn;
  private readonly now: NowFn;
  private lastRequestAt = 0;

  constructor(options: PdlClientOptions) {
    const apiKey = options.apiKey.trim();
    if (!apiKey) {
      throw new PdlClientValidationError("PDL apiKey is required.");
    }

    const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new PdlClientValidationError(`pageSize must be an integer between 1 and ${MAX_PAGE_SIZE}.`);
    }

    const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    if (!Number.isInteger(maxRetries) || maxRetries < 0 || maxRetries > 10) {
      throw new PdlClientValidationError("maxRetries must be an integer between 0 and 10.");
    }

    const minRequestIntervalMs = options.minRequestIntervalMs ?? DEFAULT_MIN_REQUEST_INTERVAL_MS;
    if (!Number.isInteger(minRequestIntervalMs) || minRequestIntervalMs < 0) {
      throw new PdlClientValidationError("minRequestIntervalMs must be a non-negative integer.");
    }

    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.pageSize = pageSize;
    this.maxRetries = maxRetries;
    this.minRequestIntervalMs = minRequestIntervalMs;
    this.fetchImpl = options.fetchImpl ?? (fetch as unknown as PdlFetch);
    this.sleep = options.sleep ?? defaultSleep;
    this.now = options.now ?? Date.now;
  }

  async searchPage(input: {
    filters?: PdlSearchFilters;
    cursor?: string | null;
    pageSize?: number;
  }): Promise<PdlSearchPage> {
    const pageSize = input.pageSize ?? this.pageSize;
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new PdlClientValidationError(`pageSize must be an integer between 1 and ${MAX_PAGE_SIZE}.`);
    }

    const payload: Record<string, unknown> = {
      size: pageSize,
      filters: normalizeFilters(input.filters),
    };

    if (input.cursor && input.cursor.trim()) {
      payload.cursor = input.cursor.trim();
    }

    return this.requestWithRetry(payload);
  }

  async fetchAllCandidates(input: {
    filters?: PdlSearchFilters;
    limit: number;
  }): Promise<PdlCandidate[]> {
    if (!Number.isInteger(input.limit) || input.limit < 1) {
      throw new PdlClientValidationError("limit must be a positive integer.");
    }

    const maxRequested = input.limit;
    const results: PdlCandidate[] = [];
    let cursor: string | null = null;

    while (results.length < maxRequested) {
      const remaining = maxRequested - results.length;
      const page = await this.searchPage({
        filters: input.filters,
        cursor,
        pageSize: Math.min(remaining, this.pageSize),
      });

      results.push(...page.items);

      if (!page.nextCursor || page.items.length === 0) {
        break;
      }

      cursor = page.nextCursor;
    }

    return results.slice(0, maxRequested);
  }

  private async requestWithRetry(payload: Record<string, unknown>): Promise<PdlSearchPage> {
    let attempt = 0;
    let lastError: unknown = null;

    while (attempt <= this.maxRetries) {
      try {
        await this.waitForRateWindow();

        const response = await this.fetchImpl(`${this.baseUrl}/person/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": this.apiKey,
          },
          body: JSON.stringify(payload),
        });

        this.lastRequestAt = this.now();

        const body = await response.json();
        if (!TRANSIENT_STATUS_CODES.has(response.status) && response.status >= 400) {
          throw new PdlClientRequestError("PDL request failed.", response.status, body);
        }

        if (TRANSIENT_STATUS_CODES.has(response.status)) {
          throw new PdlClientRequestError("PDL transient error.", response.status, body);
        }

        return parseSearchResponse(body);
      } catch (error) {
        lastError = error;
        const shouldRetry =
          error instanceof PdlClientRequestError ? TRANSIENT_STATUS_CODES.has(error.status) : true;

        if (!shouldRetry || attempt >= this.maxRetries) {
          throw error;
        }

        const retryDelay = Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);
        await this.sleep(retryDelay);
        attempt += 1;
      }
    }

    throw lastError;
  }

  private async waitForRateWindow() {
    if (this.minRequestIntervalMs === 0) {
      return;
    }

    const elapsed = this.now() - this.lastRequestAt;
    const waitMs = this.minRequestIntervalMs - elapsed;

    if (waitMs > 0) {
      await this.sleep(waitMs);
    }
  }
}
