import assert from "node:assert/strict";
import test from "node:test";

import { PdlClient } from "../../lib/sources/pdl-client";

function jsonResponse(status: number, payload: unknown) {
  return {
    status,
    async json() {
      return payload;
    },
  };
}

test("PdlClient paginates through mock provider responses and respects limit", async () => {
  const requestBodies: unknown[] = [];

  const client = new PdlClient({
    apiKey: "test-key",
    pageSize: 2,
    minRequestIntervalMs: 0,
    sleep: async () => {},
    fetchImpl: async (_url, init) => {
      const body = JSON.parse(init.body) as { cursor?: string };
      requestBodies.push(body);

      if (!body.cursor) {
        return jsonResponse(200, {
          data: [
            {
              id: "p1",
              first_name: "Ada",
              last_name: "Lovelace",
              work_email: "ada@example.com",
              company: { id: "c1", name: "Analytical Engines", domain: "analytical.engines" },
            },
            {
              id: "p2",
              first_name: "Grace",
              last_name: "Hopper",
              work_email: "grace@example.com",
              company: { id: "c2", name: "Compilers Inc", domain: "compilers.dev" },
            },
          ],
          next_cursor: "cursor-2",
        });
      }

      return jsonResponse(200, {
        data: [
          {
            id: "p3",
            first_name: "Katherine",
            last_name: "Johnson",
            work_email: "katherine@example.com",
            company: { id: "c3", name: "Orbital Math", domain: "orbital.math" },
          },
          {
            id: "p4",
            first_name: "Margaret",
            last_name: "Hamilton",
            work_email: "margaret@example.com",
            company: { id: "c4", name: "Apollo Logic", domain: "apollo.logic" },
          },
        ],
        next_cursor: null,
      });
    },
  });

  const candidates = await client.fetchAllCandidates({
    filters: {
      industry: ["B2B SaaS"],
      geoCountry: ["US"],
    },
    limit: 3,
  });

  assert.equal(candidates.length, 3);
  assert.deepEqual(
    candidates.map((candidate) => candidate.personProviderId),
    ["p1", "p2", "p3"],
  );
  assert.equal(requestBodies.length, 2);
});
