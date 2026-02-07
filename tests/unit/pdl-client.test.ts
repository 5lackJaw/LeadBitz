import assert from "node:assert/strict";
import test from "node:test";

import { PdlClient, PdlClientRequestError } from "../../lib/sources/pdl-client";

function jsonResponse(status: number, payload: unknown) {
  return {
    status,
    async json() {
      return payload;
    },
  };
}

test("PdlClient retries transient errors with exponential backoff", async () => {
  const responses = [
    jsonResponse(503, { error: "upstream temporary failure" }),
    jsonResponse(429, { error: "rate limited" }),
    jsonResponse(200, {
      data: [{ id: "p1", first_name: "Alice", work_email: "alice@example.com" }],
      next_cursor: null,
    }),
  ];

  let fetchCalls = 0;
  const sleepCalls: number[] = [];

  const client = new PdlClient({
    apiKey: "test-key",
    minRequestIntervalMs: 0,
    fetchImpl: async () => {
      const response = responses[fetchCalls];
      fetchCalls += 1;
      return response ?? jsonResponse(500, { error: "unexpected extra call" });
    },
    sleep: async (ms) => {
      sleepCalls.push(ms);
    },
  });

  const page = await client.searchPage({
    filters: { industry: ["B2B SaaS"] },
  });

  assert.equal(fetchCalls, 3);
  assert.deepEqual(sleepCalls, [250, 500]);
  assert.equal(page.items.length, 1);
  assert.equal(page.items[0]?.personProviderId, "p1");
});

test("PdlClient throws after max retry budget is exhausted", async () => {
  const client = new PdlClient({
    apiKey: "test-key",
    maxRetries: 1,
    minRequestIntervalMs: 0,
    fetchImpl: async () => jsonResponse(503, { error: "still failing" }),
    sleep: async () => {},
  });

  await assert.rejects(
    () =>
      client.searchPage({
        filters: { industry: ["B2B SaaS"] },
      }),
    (error: unknown) => {
      assert.ok(error instanceof PdlClientRequestError);
      assert.equal(error.status, 503);
      return true;
    },
  );
});
