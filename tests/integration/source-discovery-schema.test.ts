import assert from "node:assert/strict";
import test from "node:test";

import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("source discovery schema integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("source discovery tables and required indexes exist", async () => {
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('source_connectors', 'source_runs', 'candidates', 'email_verifications')
      ORDER BY table_name ASC
    `;

    assert.deepEqual(
      tables.map((table) => table.table_name),
      ["candidates", "email_verifications", "source_connectors", "source_runs"],
    );

    const requiredIndexes = [
      "candidates_campaign_id_idx",
      "candidates_source_run_id_idx",
      "candidates_email_idx",
    ];

    const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'candidates'
        AND indexname = ANY(${requiredIndexes}::text[])
      ORDER BY indexname ASC
    `;

    assert.deepEqual(
      indexes.map((index) => index.indexname),
      requiredIndexes.slice().sort(),
    );
  });
}

test.after(async () => {
  await prisma.$disconnect();
});
